use serde::{Deserialize, Serialize};
use tauri::Emitter;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Child;
use tokio::sync::Mutex;

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
    pub processes: Mutex<HashMap<String, ProcessHandle>>,
}

pub struct ProcessHandle {
    pub child: Child,
    pub stdin_tx: Option<tokio::sync::mpsc::Sender<String>>,
}

impl ProcessState {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
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
    // Build CLI arguments
    let mut args: Vec<String> = Vec::new();
    if let Some(ref m) = model {
        args.push("--model".to_string());
        args.push(m.clone());
    }
    args.extend(extra_args);

    // Spawn Claude Code process
    let mut child = tokio::process::Command::new("claude")
        .args(&args)
        .current_dir(&project_path)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .stdin(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn claude: {}", e))?;

    let pid = child.id().unwrap_or(0);

    // Take stdout/stderr/stdin handles
    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    let stdin = child.stdin.take();

    // Setup stdin channel
    let (stdin_tx, mut stdin_rx) = tokio::sync::mpsc::channel::<String>(32);

    // Spawn stdin writer
    if let Some(mut stdin_handle) = stdin {
        tokio::spawn(async move {
            while let Some(msg) = stdin_rx.recv().await {
                if stdin_handle.write_all(msg.as_bytes()).await.is_err() {
                    break;
                }
                if stdin_handle.write_all(b"\n").await.is_err() {
                    break;
                }
                let _ = stdin_handle.flush().await;
            }
        });
    }

    // Spawn stdout reader — emit Tauri events
    let sid_stdout = session_id.clone();
    let app_stdout = app.clone();
    if let Some(stdout_handle) = stdout {
        tokio::spawn(async move {
            let reader = BufReader::new(stdout_handle);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let payload = SessionOutput {
                    content: format!("{}\r\n", line),
                    log_type: "stdout".to_string(),
                };
                let event_name = format!("session-output-{}", sid_stdout);
                let _ = app_stdout.emit(&event_name, &payload);
            }
        });
    }

    // Spawn stderr reader — emit Tauri events
    let sid_stderr = session_id.clone();
    let app_stderr = app.clone();
    if let Some(stderr_handle) = stderr {
        tokio::spawn(async move {
            let reader = BufReader::new(stderr_handle);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let payload = SessionOutput {
                    content: format!("{}\r\n", line),
                    log_type: "stderr".to_string(),
                };
                let event_name = format!("session-output-{}", sid_stderr);
                let _ = app_stderr.emit(&event_name, &payload);
            }
        });
    }

    // Store handle
    {
        let mut procs = state.processes.lock().await;
        procs.insert(session_id.clone(), ProcessHandle {
            child,
            stdin_tx: Some(stdin_tx),
        });
    }

    Ok(ProcessInfo {
        pid,
        session_id,
        alive: true,
    })
}

#[tauri::command]
pub async fn kill_process(
    state: tauri::State<'_, Arc<ProcessState>>,
    session_id: String,
) -> Result<(), String> {
    let mut procs = state.processes.lock().await;
    if let Some(mut handle) = procs.remove(&session_id) {
        handle.child.kill().await.map_err(|e| format!("Kill failed: {}", e))?;
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
    let procs = state.processes.lock().await;
    if let Some(handle) = procs.get(&session_id) {
        if let Some(ref tx) = handle.stdin_tx {
            tx.send(message).await.map_err(|e| format!("Send failed: {}", e))?;
            Ok(())
        } else {
            Err("No stdin channel".to_string())
        }
    } else {
        Err("Session process not found".to_string())
    }
}
