// Database service - SQLite operations via tauri-plugin-sql
// The actual SQL queries run through the plugin's JS API
// This module provides Rust-side helpers for data transformation

use crate::models::session::Session;

/// Convert a database row into a Session struct
pub fn row_to_session(
    id: String,
    project_id: String,
    pid: Option<u32>,
    status: String,
    started_at: Option<String>,
    ended_at: Option<String>,
    total_tokens_used: i64,
    total_cost_cents: i64,
    model: String,
    log_path: Option<String>,
    config_override_json: String,
    created_at: String,
) -> Session {
    Session {
        id,
        project_id,
        pid,
        status,
        started_at,
        ended_at,
        total_tokens_used,
        total_cost_cents,
        model,
        log_path,
        config_override_json,
        created_at,
    }
}
