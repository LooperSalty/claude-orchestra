mod commands;
mod models;
mod services;

use commands::{sessions, processes, filesystem, config, auth};
use services::db;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let process_state = Arc::new(processes::ProcessState::new());

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:orchestra.db", db::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .manage(process_state)
        .invoke_handler(tauri::generate_handler![
            sessions::list_sessions,
            sessions::create_session,
            sessions::stop_session,
            sessions::get_session,
            processes::spawn_process,
            processes::kill_process,
            processes::send_input,
            filesystem::scan_projects,
            filesystem::read_claude_md,
            filesystem::write_claude_md,
            filesystem::scan_skills,
            config::get_config,
            config::set_config,
            config::detect_claude_code,
            auth::validate_api_key,
            auth::save_api_key,
            auth::get_api_key,
            auth::delete_api_key,
            auth::get_account_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
