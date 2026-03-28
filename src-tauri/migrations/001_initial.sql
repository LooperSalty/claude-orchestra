CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    description TEXT,
    last_opened_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    config_json TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    pinned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    pid INTEGER,
    status TEXT CHECK(status IN ('running','stopped','error','paused')) DEFAULT 'stopped',
    started_at TEXT,
    ended_at TEXT,
    total_tokens_used INTEGER DEFAULT 0,
    total_cost_cents INTEGER DEFAULT 0,
    model TEXT DEFAULT 'claude-sonnet-4-6',
    log_path TEXT,
    config_override_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    claude_md_template TEXT,
    model TEXT DEFAULT 'claude-sonnet-4-6',
    max_tokens INTEGER DEFAULT 8192,
    temperature REAL DEFAULT 0.0,
    tools_enabled TEXT DEFAULT '[]',
    mcp_servers TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    path TEXT NOT NULL,
    version TEXT,
    category TEXT,
    icon TEXT,
    is_builtin INTEGER DEFAULT 0,
    is_enabled INTEGER DEFAULT 1,
    config_json TEXT DEFAULT '{}',
    readme_content TEXT,
    installed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plugins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('mcp_server','extension','tool')) DEFAULT 'mcp_server',
    url TEXT,
    description TEXT,
    status TEXT CHECK(status IN ('connected','disconnected','error')) DEFAULT 'disconnected',
    config_json TEXT DEFAULT '{}',
    auth_json TEXT DEFAULT '{}',
    installed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memory_files (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    file_path TEXT NOT NULL,
    content TEXT,
    content_hash TEXT,
    last_synced_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES sessions(id),
    metric_type TEXT NOT NULL,
    value REAL NOT NULL,
    metadata_json TEXT DEFAULT '{}',
    recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES sessions(id),
    log_type TEXT CHECK(log_type IN ('stdin','stdout','stderr','system')) DEFAULT 'stdout',
    content TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_memory_project ON memory_files(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_session ON session_logs(session_id);
