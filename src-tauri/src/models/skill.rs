use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub path: String,
    pub version: Option<String>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub is_builtin: bool,
    pub is_enabled: bool,
    pub config_json: String,
    pub readme_content: Option<String>,
    pub installed_at: String,
}
