use crate::models::session::{Session, SessionConfig};
use uuid::Uuid;

#[tauri::command]
pub async fn list_sessions() -> Result<Vec<Session>, String> {
    // TODO: Query from SQLite
    Ok(vec![])
}

#[tauri::command]
pub async fn create_session(config: SessionConfig) -> Result<Session, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let session = Session {
        id: Uuid::new_v4().to_string(),
        project_id: String::new(),
        pid: None,
        status: "stopped".to_string(),
        started_at: None,
        ended_at: None,
        total_tokens_used: 0,
        total_cost_cents: 0,
        model: config.model.unwrap_or_else(|| "claude-sonnet-4-6".to_string()),
        log_path: None,
        config_override_json: "{}".to_string(),
        created_at: now,
    };
    // TODO: Insert into SQLite + spawn process
    Ok(session)
}

#[tauri::command]
pub async fn stop_session(session_id: String) -> Result<(), String> {
    // TODO: Kill process + update DB
    let _ = session_id;
    Ok(())
}

#[tauri::command]
pub async fn get_session(session_id: String) -> Result<Option<Session>, String> {
    // TODO: Query from SQLite
    let _ = session_id;
    Ok(None)
}
