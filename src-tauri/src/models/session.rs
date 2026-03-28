use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub last_opened_at: Option<String>,
    pub created_at: String,
    pub config_json: String,
    pub tags: String,
    pub pinned: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub project_id: String,
    pub pid: Option<u32>,
    pub status: String,
    pub started_at: Option<String>,
    pub ended_at: Option<String>,
    pub total_tokens_used: i64,
    pub total_cost_cents: i64,
    pub model: String,
    pub log_path: Option<String>,
    pub config_override_json: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: i64,
    pub session_id: String,
    pub log_type: String,
    pub content: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfig {
    pub project_path: String,
    pub model: Option<String>,
    pub agent_id: Option<String>,
    pub extra_args: Vec<String>,
}
