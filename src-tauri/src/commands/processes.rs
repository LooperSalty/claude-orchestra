use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use portable_pty::{CommandBuilder, PtySize, native_pty_system, PtySystem, Child as PtyChild};
use std::io::{Read, Write};
use tauri::ipc::Channel;

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

pub struct ProcessState {
    pub writers: Mutex<HashMap<String, Box<dyn Write + Send>>>,
}

impl ProcessState {
    pub fn new() -> Self {
        Self {
            writers: Mutex::new(HashMap::new()),
        }
    }
}

#[tauri::command]
pub async fn spawn_process(
    state: tauri::State<'_, Arc<ProcessState>>,
    on_output: Channel<SessionOutput>,
    session_id: String,
    project_path: String,
    model: Option<String>,
    extra_args: Vec<String>,
) -> Result<ProcessInfo, String> {
    eprintln!("[ORCHESTRA] spawn_process: session={}, path={}", session_id, project_path);

    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 30,
            cols: 120,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    // Build claude command
    let mut claude_args = String::from("claude");
    if let Some(ref m) = model {
        claude_args.push_str(&format!(" --model {}", m));
    }
    for arg in &extra_args {
        claude_args.push_str(&format!(" {}", arg));
    }

    let mut cmd = CommandBuilder::new("cmd.exe");
    cmd.cwd(&project_path);
    for (key, value) in std::env::vars() {
        cmd.env(key, value);
    }
    cmd.env("FORCE_COLOR", "1");
    cmd.env("TERM", "xterm-256color");

    let mut child: Box<dyn PtyChild + Send + Sync> = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    eprintln!("[ORCHESTRA] Shell spawned OK");

    // Get reader and writer from master BEFORE dropping anything
    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get reader: {}", e))?;

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get writer: {}", e))?;

    eprintln!("[ORCHESTRA] Got reader and writer");

    // Send diagnostic
    let _ = on_output.send(SessionOutput {
        content: format!(
            "\x1b[90m[Orchestra] Launching: {} in {}\x1b[0m\r\n",
            claude_args, project_path
        ),
        log_type: "stdout".to_string(),
    });

    // Store writer
    let sid = session_id.clone();
    {
        let mut writers = state.writers.lock().await;
        writers.insert(sid.clone(), writer);
    }

    // Send claude command
    {
        let mut writers = state.writers.lock().await;
        if let Some(w) = writers.get_mut(&sid) {
            let cmd_str = format!("{}\r\n", claude_args);
            let _ = w.write_all(cmd_str.as_bytes());
            let _ = w.flush();
            eprintln!("[ORCHESTRA] Sent command: {}", claude_args);
        }
    }

    // Spawn reader thread — keep slave alive by moving it into the thread
    let slave = pair.slave;
    let sid_reader = session_id.clone();
    std::thread::spawn(move || {
        // Keep slave alive so the PTY doesn't close
        let _slave = slave;
        let mut _child = child;

        eprintln!("[ORCHESTRA] Reader thread started for {}", sid_reader);
        let mut buf = [0u8; 4096];

        loop {
            match reader.read(&mut buf) {
                Ok(0) => {
                    eprintln!("[ORCHESTRA] Reader EOF for {}", sid_reader);
                    break;
                }
                Ok(n) => {
                    eprintln!("[ORCHESTRA] Read {} bytes", n);
                    let content = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = on_output.send(SessionOutput {
                        content,
                        log_type: "stdout".to_string(),
                    });
                }
                Err(e) => {
                    eprintln!("[ORCHESTRA] Read error: {}", e);
                    let _ = on_output.send(SessionOutput {
                        content: format!("\r\n\x1b[31m[Error] {}\x1b[0m\r\n", e),
                        log_type: "stderr".to_string(),
                    });
                    break;
                }
            }
        }

        // Wait for child to finish
        let _ = _child.wait();

        let _ = on_output.send(SessionOutput {
            content: "\r\n\x1b[90m[Orchestra] Session ended.\x1b[0m\r\n".to_string(),
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
    let mut writers = state.writers.lock().await;
    writers.remove(&session_id);
    Ok(())
}

#[tauri::command]
pub async fn send_input(
    state: tauri::State<'_, Arc<ProcessState>>,
    session_id: String,
    message: String,
) -> Result<(), String> {
    let mut writers = state.writers.lock().await;
    if let Some(w) = writers.get_mut(&session_id) {
        w.write_all(message.as_bytes())
            .map_err(|e| format!("Write failed: {}", e))?;
        w.flush()
            .map_err(|e| format!("Flush failed: {}", e))?;
        Ok(())
    } else {
        Err("Session not found".to_string())
    }
}
