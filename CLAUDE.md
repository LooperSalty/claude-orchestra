# Claude Orchestra — Project Guidelines

## Overview
Desktop application (Tauri v2 + React + TypeScript) for managing multiple Claude Code instances, agents, skills, plugins, memory files, and configuration from a single unified dashboard.

## Tech Stack
- **Desktop Runtime**: Tauri v2 (Rust backend)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Framer Motion
- **State**: Zustand stores
- **Database**: SQLite via tauri-plugin-sql
- **Terminal**: xterm.js
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: JetBrains Mono (code), Geist Sans (UI)

## Code Style
- Use functional components with hooks exclusively
- TypeScript strict mode — no `any` types
- Zustand stores in `src/stores/` — one per domain
- Tauri commands in `src-tauri/src/commands/` — one module per domain
- All Tauri commands return `Result<T, String>` and use `#[tauri::command]`
- CSS: use Tailwind utilities, CSS variables from design system
- Animations: Framer Motion for mount/unmount, CSS for hover/micro-interactions
- File naming: PascalCase for components, camelCase for hooks/utils
- No default exports except for page-level components

## Architecture Rules
- Frontend never accesses filesystem directly — always through Tauri commands
- All database operations happen in Rust, exposed via commands
- Real-time updates use Tauri event system (emit/listen)
- Process management (Claude Code instances) exclusively in Rust via tokio
- API keys stored encrypted, never in plaintext

## Design System
- Theme: "Midnight Control" — dark, deep blue-black surfaces with electric blue accents
- Glow effects on active/running elements
- Status colors: green=running, blue=idle, amber=warning, red=error
- All cards use glassmorphism with subtle border glow
- Staggered entrance animations for list items
- Command Palette (Ctrl+K) is the universal navigation entry point

## Testing
- Unit tests for Rust commands with `#[cfg(test)]`
- Component tests with Vitest + React Testing Library
- E2E tests with Playwright for critical flows
