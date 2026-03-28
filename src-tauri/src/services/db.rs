use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                project_name TEXT NOT NULL,
                project_path TEXT NOT NULL,
                pid INTEGER,
                status TEXT NOT NULL DEFAULT 'idle',
                started_at TEXT,
                stopped_at TEXT,
                total_tokens INTEGER DEFAULT 0,
                total_cost REAL DEFAULT 0.0,
                model TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
                log_path TEXT,
                config_override TEXT
            );

            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                system_prompt TEXT,
                claude_md_template TEXT,
                model TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
                max_tokens INTEGER DEFAULT 8192,
                temperature REAL DEFAULT 0.7,
                tools_enabled INTEGER DEFAULT 1,
                mcp_servers TEXT DEFAULT '[]',
                is_builtin INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                path TEXT NOT NULL,
                version TEXT,
                category TEXT DEFAULT 'custom',
                icon TEXT,
                is_builtin INTEGER DEFAULT 0,
                is_enabled INTEGER DEFAULT 1,
                config_json TEXT DEFAULT '{}',
                readme_content TEXT,
                installed_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS plugins (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                plugin_type TEXT NOT NULL DEFAULT 'mcp',
                version TEXT,
                status TEXT NOT NULL DEFAULT 'disconnected',
                config_json TEXT DEFAULT '{}',
                server_url TEXT,
                installed_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS prompts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                is_favorite INTEGER DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS session_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                log_type TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            );

            CREATE INDEX idx_session_logs_session ON session_logs(session_id);
            CREATE INDEX idx_sessions_status ON sessions(status);
            CREATE INDEX idx_agents_builtin ON agents(is_builtin);
            CREATE INDEX idx_skills_enabled ON skills(is_enabled);",
            kind: MigrationKind::Up,
        },
    ]
}
