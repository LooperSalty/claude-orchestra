use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub system_prompt: Option<String>,
    pub claude_md_template: Option<String>,
    pub model: String,
    pub max_tokens: i64,
    pub temperature: f64,
    pub tools_enabled: String,
    pub mcp_servers: String,
    pub created_at: String,
    pub updated_at: String,
}
