use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub session_id: String,
    pub alive: bool,
}

#[tauri::command]
pub async fn spawn_process(
    session_id: String,
    project_path: String,
    model: Option<String>,
    extra_args: Vec<String>,
) -> Result<ProcessInfo, String> {
    // Build CLI arguments
    let mut args = vec!["--print-output".to_string()];
    if let Some(m) = model {
        args.push("--model".to_string());
        args.push(m);
    }
    args.extend(extra_args);

    // Spawn Claude Code process
    let child = tokio::process::Command::new("claude")
        .args(&args)
        .current_dir(&project_path)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .stdin(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn claude: {}", e))?;

    let pid = child.id().unwrap_or(0);

    // TODO: Store child handle in process manager state
    // TODO: Spawn log watchers that emit Tauri events

    Ok(ProcessInfo {
        pid,
        session_id,
        alive: true,
    })
}

#[tauri::command]
pub async fn kill_process(session_id: String) -> Result<(), String> {
    // TODO: Lookup process by session_id and send SIGTERM
    let _ = session_id;
    Ok(())
}

#[tauri::command]
pub async fn send_input(session_id: String, message: String) -> Result<(), String> {
    // TODO: Write to stdin of the process
    let _ = (session_id, message);
    Ok(())
}
