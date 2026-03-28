# Claude Orchestra

> **[Read in English](README.md)**

Un tableau de bord de bureau pour gerer plusieurs instances [Claude Code](https://docs.anthropic.com/en/docs/claude-code), agents, skills, plugins, fichiers memoire et configuration depuis une interface unifiee.

![Tauri](https://img.shields.io/badge/Tauri_v2-FFC131?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/Licence-MIT-green)

---

## Fonctionnalites

- **Gestion des sessions** — Lancer, surveiller et arreter plusieurs sessions Claude Code simultanement
- **Controle des processus** — Creer, arreter et envoyer des commandes aux processus Claude Code avec un terminal xterm.js integre
- **Tableau de bord agents** — Visualiser et gerer vos agents Claude Code depuis un seul endroit
- **Explorateur de skills** — Parcourir, inspecter et organiser les skills installees
- **Gestionnaire de plugins** — Gerer les plugins et leurs configurations
- **Editeur de memoire** — Lire et modifier les fichiers CLAUDE.md et memoire de vos projets
- **Metriques et graphiques** — Visualiser l'activite des sessions et l'utilisation des ressources avec Recharts
- **Scanner de projets** — Decouverte automatique des projets et de leurs configurations Claude Code
- **Palette de commandes** — Navigation rapide avec `Ctrl+K`
- **Theme sombre** — Design "Midnight Control" avec glassmorphisme, effets lumineux et animations fluides

## Stack technique

| Couche | Technologie |
|--------|------------|
| Runtime bureau | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Style | Tailwind CSS 4 + Framer Motion |
| Gestion d'etat | Zustand |
| Base de donnees | SQLite (tauri-plugin-sql) |
| Terminal | xterm.js |
| Graphiques | Recharts |
| Icones | Lucide React |
| Polices | JetBrains Mono (code), Geist Sans (UI) |

## Architecture

```
claude-orchestra/
├── src/                    # Frontend React
│   ├── components/
│   │   ├── agents/         # UI de gestion des agents
│   │   ├── config/         # Panneaux de configuration
│   │   ├── layout/         # Shell, barre laterale, en-tete
│   │   ├── memory/         # Editeur memoire/CLAUDE.md
│   │   ├── metrics/        # Graphiques et tableaux de bord
│   │   ├── plugins/        # Gestion des plugins
│   │   ├── sessions/       # Liste et controles des sessions
│   │   ├── shared/         # Composants UI reutilisables
│   │   └── skills/         # Explorateur de skills
│   ├── stores/             # Stores Zustand (un par domaine)
│   ├── hooks/              # Hooks React personnalises
│   ├── lib/                # Utilitaires
│   └── types/              # Definitions de types TypeScript
│
├── src-tauri/              # Backend Rust
│   └── src/
│       ├── commands/       # Commandes IPC Tauri
│       │   ├── sessions.rs
│       │   ├── processes.rs
│       │   ├── filesystem.rs
│       │   └── config.rs
│       ├── models/         # Modeles de donnees
│       ├── services/       # Logique metier
│       └── utils/          # Fonctions utilitaires
│
└── public/                 # Ressources statiques
```

## Prerequis

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) (derniere version stable)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installe et configure
- Dependances Tauri specifiques a votre plateforme — voir les [prerequis Tauri v2](https://v2.tauri.app/start/prerequisites/)

## Demarrage rapide

```bash
# Cloner le depot
git clone https://github.com/LooperSalty/claude-orchestra.git
cd claude-orchestra

# Installer les dependances
npm install

# Lancer en mode developpement (demarre Vite et Tauri)
npm run tauri:dev

# Compiler pour la production
npm run tauri:build
```

Le serveur de dev demarre sur `http://localhost:1420` et la fenetre Tauri s'ouvre automatiquement.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Demarrer le serveur Vite uniquement |
| `npm run build` | Compiler le frontend (TypeScript + Vite) |
| `npm run tauri:dev` | Demarrer l'environnement de dev Tauri complet |
| `npm run tauri:build` | Compiler l'application bureau de production |
| `npm run preview` | Previsualiser le build de production |

## Philosophie de design

Claude Orchestra utilise un langage visuel **"Midnight Control"** :

- Surfaces bleu-noir profondes avec accents bleu electrique
- Cartes glassmorphisme avec lueur subtile sur les bordures
- Indicateurs de statut : 🟢 en cours, 🔵 inactif, 🟡 avertissement, 🔴 erreur
- Animations d'entree echelonnees pour les listes
- Effets lumineux sur les elements actifs

## Contribuer

Les contributions sont les bienvenues ! Ouvrez d'abord une issue pour discuter de vos changements.

1. Forkez le depot
2. Creez votre branche (`git checkout -b feat/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m "feat: ajout de ma fonctionnalite"`)
4. Poussez la branche (`git push origin feat/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

[MIT](LICENSE)
