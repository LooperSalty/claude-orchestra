use crate::models::session::Project;
use crate::models::skill::Skill;
use std::path::PathBuf;
use uuid::Uuid;

#[tauri::command]
pub async fn scan_projects(base_paths: Vec<String>) -> Result<Vec<Project>, String> {
    let mut projects = Vec::new();

    for base in &base_paths {
        let base_path = PathBuf::from(base);
        if !base_path.exists() {
            continue;
        }

        let entries = std::fs::read_dir(&base_path)
            .map_err(|e| format!("Cannot read directory: {}", e))?;

        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            // Check for CLAUDE.md or .claude/ directory as indicators
            let has_claude_md = path.join("CLAUDE.md").exists();
            let has_claude_dir = path.join(".claude").exists();
            let has_git = path.join(".git").exists();

            if has_claude_md || has_claude_dir || has_git {
                let name = path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let now = chrono::Utc::now().to_rfc3339();

                projects.push(Project {
                    id: Uuid::new_v4().to_string(),
                    name,
                    path: path.to_string_lossy().to_string(),
                    description: None,
                    last_opened_at: None,
                    created_at: now,
                    config_json: "{}".to_string(),
                    tags: "[]".to_string(),
                    pinned: false,
                });
            }
        }
    }

    Ok(projects)
}

#[tauri::command]
pub async fn read_claude_md(project_path: String) -> Result<Option<String>, String> {
    let path = PathBuf::from(&project_path).join("CLAUDE.md");
    if path.exists() {
        std::fs::read_to_string(&path)
            .map(Some)
            .map_err(|e| format!("Cannot read CLAUDE.md: {}", e))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn write_claude_md(project_path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(&project_path).join("CLAUDE.md");
    std::fs::write(&path, &content)
        .map_err(|e| format!("Cannot write CLAUDE.md: {}", e))
}

#[tauri::command]
pub async fn scan_skills(skills_paths: Vec<String>) -> Result<Vec<Skill>, String> {
    let mut skills = Vec::new();

    for base in &skills_paths {
        let base_path = PathBuf::from(base);
        if !base_path.exists() {
            continue;
        }

        let entries = std::fs::read_dir(&base_path)
            .map_err(|e| format!("Cannot read skills directory: {}", e))?;

        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            let skill_md = path.join("SKILL.md");
            if !skill_md.exists() {
                continue;
            }

            let content = std::fs::read_to_string(&skill_md).unwrap_or_default();
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let now = chrono::Utc::now().to_rfc3339();

            skills.push(Skill {
                id: Uuid::new_v4().to_string(),
                name,
                description: extract_description(&content),
                path: path.to_string_lossy().to_string(),
                version: None,
                category: None,
                icon: None,
                is_builtin: base.contains("public"),
                is_enabled: true,
                config_json: "{}".to_string(),
                readme_content: Some(content),
                installed_at: now,
            });
        }
    }

    Ok(skills)
}

fn extract_description(content: &str) -> Option<String> {
    // Simple extraction: look for "description:" in frontmatter
    for line in content.lines() {
        let trimmed = line.trim();
        if let Some(desc) = trimmed.strip_prefix("description:") {
            let desc = desc.trim().trim_matches('"').trim_matches('\'');
            if !desc.is_empty() {
                return Some(desc.to_string());
            }
        }
    }
    None
}
