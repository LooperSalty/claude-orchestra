# Claude Orchestra

> **[Lire en francais](README.fr.md)**

A desktop dashboard for managing multiple [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instances, agents, skills, plugins, memory files, and configuration from a single unified interface.

![Tauri](https://img.shields.io/badge/Tauri_v2-FFC131?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Session Management** — Launch, monitor, and stop multiple Claude Code sessions simultaneously
- **Process Control** — Spawn, kill, and send input to Claude Code processes with a built-in xterm.js terminal
- **Agent Dashboard** — View and manage your Claude Code agents from one place
- **Skill Browser** — Browse, inspect, and organize installed skills
- **Plugin Manager** — Manage plugins and their configurations
- **Memory Editor** — Read and edit CLAUDE.md and memory files across projects
- **Metrics & Charts** — Visualize session activity and resource usage with Recharts
- **Project Scanner** — Automatically discover projects and their Claude Code configurations
- **Command Palette** — Quick navigation with `Ctrl+K`
- **Dark Theme** — "Midnight Control" design with glassmorphism, glow effects, and smooth animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + Framer Motion |
| State Management | Zustand |
| Database | SQLite (tauri-plugin-sql) |
| Terminal | xterm.js |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | JetBrains Mono (code), Geist Sans (UI) |

## Architecture

```
claude-orchestra/
├── src/                    # React frontend
│   ├── components/
│   │   ├── agents/         # Agent management UI
│   │   ├── config/         # Configuration panels
│   │   ├── layout/         # App shell, sidebar, header
│   │   ├── memory/         # Memory/CLAUDE.md editor
│   │   ├── metrics/        # Charts and dashboards
│   │   ├── plugins/        # Plugin management
│   │   ├── sessions/       # Session list and controls
│   │   ├── shared/         # Reusable UI components
│   │   └── skills/         # Skill browser
│   ├── stores/             # Zustand stores (one per domain)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   └── types/              # TypeScript type definitions
│
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands/       # Tauri IPC commands
│       │   ├── sessions.rs
│       │   ├── processes.rs
│       │   ├── filesystem.rs
│       │   └── config.rs
│       ├── models/         # Data models
│       ├── services/       # Business logic
│       └── utils/          # Helpers
│
└── public/                 # Static assets
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- Platform-specific Tauri dependencies — see the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/LooperSalty/claude-orchestra.git
cd claude-orchestra

# Install dependencies
npm install

# Run in development mode (launches both Vite and Tauri)
npm run tauri:dev

# Build for production
npm run tauri:build
```

The dev server starts at `http://localhost:1420` and the Tauri window opens automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build frontend (TypeScript + Vite) |
| `npm run tauri:dev` | Start full Tauri development environment |
| `npm run tauri:build` | Build production desktop app |
| `npm run preview` | Preview production build |

## Design Philosophy

Claude Orchestra uses a **"Midnight Control"** design language:

- Deep blue-black surfaces with electric blue accents
- Glassmorphism cards with subtle border glow
- Status indicators: 🟢 running, 🔵 idle, 🟡 warning, 🔴 error
- Staggered entrance animations for list items
- Glow effects on active/running elements

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
