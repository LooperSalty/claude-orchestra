use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub claude_code_path: Option<String>,
    pub claude_code_version: Option<String>,
    pub home_dir: String,
    pub claude_dir: String,
    pub settings_path: String,
}

#[tauri::command]
pub async fn get_config() -> Result<AppConfig, String> {
    let home = dirs_or_fallback();
    let claude_dir = format!("{}/.claude", home);
    let settings_path = format!("{}/settings.json", claude_dir);

    Ok(AppConfig {
        claude_code_path: which_claude().await,
        claude_code_version: get_claude_version().await,
        home_dir: home,
        claude_dir,
        settings_path,
    })
}

#[tauri::command]
pub async fn set_config(key: String, value: String) -> Result<(), String> {
    // TODO: Persist to SQLite or local config file
    let _ = (key, value);
    Ok(())
}

#[tauri::command]
pub async fn detect_claude_code() -> Result<bool, String> {
    Ok(which_claude().await.is_some())
}

async fn which_claude() -> Option<String> {
    let output = tokio::process::Command::new("where")
        .arg("claude")
        .output()
        .await
        .ok()?;

    if output.status.success() {
        let path = String::from_utf8_lossy(&output.stdout)
            .lines()
            .next()?
            .trim()
            .to_string();
        Some(path)
    } else {
        None
    }
}

async fn get_claude_version() -> Option<String> {
    let output = tokio::process::Command::new("claude")
        .arg("--version")
        .output()
        .await
        .ok()?;

    if output.status.success() {
        Some(
            String::from_utf8_lossy(&output.stdout)
                .trim()
                .to_string(),
        )
    } else {
        None
    }
}

fn dirs_or_fallback() -> String {
    if let Ok(home) = std::env::var("USERPROFILE") {
        home
    } else if let Ok(home) = std::env::var("HOME") {
        home
    } else {
        ".".to_string()
    }
}
