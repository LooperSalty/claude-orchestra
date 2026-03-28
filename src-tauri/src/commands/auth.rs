use crate::models::auth::{AccountInfo, ApiKeyInfo, ModelInfo};
use serde::Deserialize;
use std::path::PathBuf;

const ANTHROPIC_MODELS_URL: &str = "https://api.anthropic.com/v1/models";
const CONFIG_FILE_NAME: &str = "auth.json";

fn get_config_dir() -> Result<PathBuf, String> {
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .map_err(|_| "Cannot determine home directory".to_string())?;

    let dir = PathBuf::from(home)
        .join(".claude-orchestra");

    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create config directory: {e}"))?;

    Ok(dir)
}

fn get_config_path() -> Result<PathBuf, String> {
    Ok(get_config_dir()?.join(CONFIG_FILE_NAME))
}

/// Simple XOR-based obfuscation with a static key.
/// Not cryptographically secure, but prevents plain-text storage.
fn obfuscate(input: &str) -> String {
    let key = b"claude-orchestra-key-salt-2024";
    let obfuscated: Vec<u8> = input
        .as_bytes()
        .iter()
        .enumerate()
        .map(|(i, b)| b ^ key[i % key.len()])
        .collect();
    base64_encode(&obfuscated)
}

fn deobfuscate(encoded: &str) -> Result<String, String> {
    let key = b"claude-orchestra-key-salt-2024";
    let bytes = base64_decode(encoded)?;
    let original: Vec<u8> = bytes
        .iter()
        .enumerate()
        .map(|(i, b)| b ^ key[i % key.len()])
        .collect();
    String::from_utf8(original).map_err(|e| format!("Invalid UTF-8 in deobfuscated key: {e}"))
}

fn base64_encode(data: &[u8]) -> String {
    use std::fmt::Write;
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    const DECODE: [u8; 128] = {
        let mut table = [255u8; 128];
        let chars = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut i = 0;
        while i < 64 {
            table[chars[i] as usize] = i as u8;
            i += 1;
        }
        table
    };

    let input = input.trim_end_matches('=');
    let mut bytes = Vec::new();
    let chars: Vec<u8> = input.bytes().collect();

    for chunk in chars.chunks(4) {
        let mut triple: u32 = 0;
        for (i, &c) in chunk.iter().enumerate() {
            if c >= 128 || DECODE[c as usize] == 255 {
                return Err("Invalid base64 character".to_string());
            }
            triple |= (DECODE[c as usize] as u32) << (18 - 6 * i);
        }
        bytes.push((triple >> 16) as u8);
        if chunk.len() > 2 {
            bytes.push((triple >> 8) as u8);
        }
        if chunk.len() > 3 {
            bytes.push(triple as u8);
        }
    }

    Ok(bytes)
}

#[derive(Deserialize)]
struct AnthropicModelsResponse {
    data: Vec<AnthropicModel>,
}

#[derive(Deserialize)]
struct AnthropicModel {
    id: String,
    display_name: String,
}

#[tauri::command]
pub async fn validate_api_key(key: String) -> Result<ApiKeyInfo, String> {
    let client = reqwest::Client::new();

    let response = client
        .get(ANTHROPIC_MODELS_URL)
        .header("x-api-key", &key)
        .header("anthropic-version", "2023-06-01")
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !response.status().is_success() {
        let status = response.status().as_u16();
        let body = response.text().await.unwrap_or_default();
        return Ok(ApiKeyInfo {
            valid: false,
            models: vec![format!("Error {status}: {body}")],
        });
    }

    let models_response: AnthropicModelsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {e}"))?;

    let model_ids: Vec<String> = models_response
        .data
        .iter()
        .map(|m| m.id.clone())
        .collect();

    Ok(ApiKeyInfo {
        valid: true,
        models: model_ids,
    })
}

#[tauri::command]
pub async fn save_api_key(key: String) -> Result<(), String> {
    let config_path = get_config_path()?;
    let encrypted = obfuscate(&key);

    let content = serde_json::json!({
        "encrypted_key": encrypted,
    });

    std::fs::write(&config_path, serde_json::to_string_pretty(&content).unwrap())
        .map_err(|e| format!("Failed to write config: {e}"))?;

    Ok(())
}

#[tauri::command]
pub async fn get_api_key() -> Result<Option<String>, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {e}"))?;

    let parsed: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {e}"))?;

    let encrypted = parsed
        .get("encrypted_key")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "No key found in config".to_string())?;

    let key = deobfuscate(encrypted)?;
    Ok(Some(key))
}

#[tauri::command]
pub async fn delete_api_key() -> Result<(), String> {
    let config_path = get_config_path()?;

    if config_path.exists() {
        std::fs::remove_file(&config_path)
            .map_err(|e| format!("Failed to delete config: {e}"))?;
    }

    Ok(())
}

#[tauri::command]
pub async fn get_account_info(key: String) -> Result<AccountInfo, String> {
    let client = reqwest::Client::new();

    let response = client
        .get(ANTHROPIC_MODELS_URL)
        .header("x-api-key", &key)
        .header("anthropic-version", "2023-06-01")
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("API error: {}", response.status()));
    }

    let models_response: AnthropicModelsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {e}"))?;

    let models: Vec<ModelInfo> = models_response
        .data
        .into_iter()
        .map(|m| ModelInfo {
            id: m.id,
            display_name: m.display_name,
        })
        .collect();

    Ok(AccountInfo { models })
}
