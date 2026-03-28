use serde::{Deserialize, Serialize};
use tauri::Emitter;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use portable_pty::{CommandBuilder, PtySize, native_pty_system, PtySystem, MasterPty};
use std::io::{Read, Write};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub session_id: String,
    pub alive: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionOutput {
    pub content: String,
    pub log_type: String,
}

/// Global state for managing running processes
pub struct ProcessState {
    pub handles: Mutex<HashMap<String, PtyHandle>>,
}

pub struct PtyHandle {
    pub writer: Box<dyn Write + Send>,
    pub alive: Arc<std::sync::atomic::AtomicBool>,
}

impl ProcessState {
    pub fn new() -> Self {
        Self {
            handles: Mutex::new(HashMap::new()),
        }
    }
}

#[tauri::command]
pub async fn spawn_process(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<ProcessState>>,
    session_id: String,
    project_path: String,
    model: Option<String>,
    extra_args: Vec<String>,
) -> Result<ProcessInfo, String> {
    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 30,
            cols: 120,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let mut cmd = CommandBuilder::new("claude");
    if let Some(ref m) = model {
        cmd.arg("--model");
        cmd.arg(m);
    }
    for arg in &extra_args {
        cmd.arg(arg);
    }
    cmd.cwd(&project_path);

    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn claude: {}", e))?;

    // Drop slave so reads on master see EOF when child exits
    drop(pair.slave);

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get PTY writer: {}", e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get PTY reader: {}", e))?;

    let alive = Arc::new(std::sync::atomic::AtomicBool::new(true));
    let alive_clone = alive.clone();

    // Store handle
    let sid = session_id.clone();
    {
        let mut handles = state.handles.lock().await;
        handles.insert(sid.clone(), PtyHandle { writer, alive: alive.clone() });
    }

    // Spawn reader thread (PTY reader is blocking, must use std thread)
    let app_clone = app.clone();
    let sid_reader = session_id.clone();
    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break, // EOF
                Ok(n) => {
                    let content = String::from_utf8_lossy(&buf[..n]).to_string();
                    let payload = SessionOutput {
                        content,
                        log_type: "stdout".to_string(),
                    };
                    let event_name = format!("session-output-{}", sid_reader);
                    let _ = app_clone.emit(&event_name, &payload);
                }
                Err(_) => break,
            }
        }
        alive_clone.store(false, std::sync::atomic::Ordering::Relaxed);
    });

    Ok(ProcessInfo {
        pid: 0, // PTY doesn't expose child PID directly
        session_id,
        alive: true,
    })
}

#[tauri::command]
pub async fn kill_process(
    state: tauri::State<'_, Arc<ProcessState>>,
    session_id: String,
) -> Result<(), String> {
    let mut handles = state.handles.lock().await;
    if let Some(handle) = handles.remove(&session_id) {
        handle.alive.store(false, std::sync::atomic::Ordering::Relaxed);
        // Dropping the writer will close the PTY, which kills the child
        drop(handle);
        Ok(())
    } else {
        Err("Session process not found".to_string())
    }
}

#[tauri::command]
pub async fn send_input(
    state: tauri::State<'_, Arc<ProcessState>>,
    session_id: String,
    message: String,
) -> Result<(), String> {
    let mut handles = state.handles.lock().await;
    if let Some(handle) = handles.get_mut(&session_id) {
        handle
            .writer
            .write_all(message.as_bytes())
            .map_err(|e| format!("Write failed: {}", e))?;
        handle
            .writer
            .flush()
            .map_err(|e| format!("Flush failed: {}", e))?;
        Ok(())
    } else {
        Err("Session process not found".to_string())
    }
}
