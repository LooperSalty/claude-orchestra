use serde::{Deserialize, Serialize};
use tauri::Emitter;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use portable_pty::{CommandBuilder, PtySize, native_pty_system, PtySystem};
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

    // Build the claude command string
    let mut claude_args = String::from("claude");
    if let Some(ref m) = model {
        claude_args.push_str(&format!(" --model {}", m));
    }
    for arg in &extra_args {
        claude_args.push_str(&format!(" {}", arg));
    }

    // Spawn an interactive shell, then we'll send the claude command into it
    let mut cmd = CommandBuilder::new("cmd.exe");
    cmd.cwd(&project_path);

    // Inherit environment
    for (key, value) in std::env::vars() {
        cmd.env(key, value);
    }
    cmd.env("FORCE_COLOR", "1");
    cmd.env("TERM", "xterm-256color");

    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    drop(pair.slave);

    let mut writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get PTY writer: {}", e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get PTY reader: {}", e))?;

    // Send the claude command to the shell after a short delay
    let claude_cmd = format!("{}\r\n", claude_args);
    let cmd_bytes = claude_cmd.into_bytes();

    // Emit a test message immediately to confirm event pipeline works
    let test_event = format!("session-output-{}", session_id);
    let _ = app.emit(&test_event, &SessionOutput {
        content: format!("\x1b[90m[Orchestra] Launching: {} in {}\x1b[0m\r\n", claude_args, project_path),
        log_type: "stdout".to_string(),
    });

    let alive = Arc::new(std::sync::atomic::AtomicBool::new(true));
    let alive_clone = alive.clone();

    let sid = session_id.clone();
    {
        // We need to send the claude command after the shell starts
        // Write it immediately — cmd.exe will buffer it
        writer.write_all(&cmd_bytes).map_err(|e| format!("Write cmd failed: {}", e))?;
        writer.flush().map_err(|e| format!("Flush failed: {}", e))?;

        let mut handles = state.handles.lock().await;
        handles.insert(sid.clone(), PtyHandle { writer, alive: alive.clone() });
    }

    // Spawn reader thread
    let app_clone = app.clone();
    let sid_reader = session_id.clone();
    std::thread::spawn(move || {
        let mut buf = [0u8; 8192];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let content = String::from_utf8_lossy(&buf[..n]).to_string();
                    let payload = SessionOutput {
                        content,
                        log_type: "stdout".to_string(),
                    };
                    let event_name = format!("session-output-{}", sid_reader);
                    let _ = app_clone.emit(&event_name, &payload);
                }
                Err(e) => {
                    let err_event = format!("session-output-{}", sid_reader);
                    let _ = app_clone.emit(&err_event, &SessionOutput {
                        content: format!("\x1b[31m[Orchestra] PTY read error: {}\x1b[0m\r\n", e),
                        log_type: "stderr".to_string(),
                    });
                    break;
                }
            }
        }
        alive_clone.store(false, std::sync::atomic::Ordering::Relaxed);
        let done_event = format!("session-output-{}", sid_reader);
        let _ = app_clone.emit(&done_event, &SessionOutput {
            content: "\r\n\x1b[90m[Orchestra] Process exited.\x1b[0m\r\n".to_string(),
            log_type: "stdout".to_string(),
        });
    });

    Ok(ProcessInfo {
        pid: 0,
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
