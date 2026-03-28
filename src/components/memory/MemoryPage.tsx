import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, FolderOpen, ChevronRight, File, Save, Eye, Code } from 'lucide-react';

interface MemoryFile {
  name: string;
  path: string;
  type: 'claude-md' | 'settings' | 'memory' | 'rules';
  projectName?: string;
}

const MEMORY_TEMPLATES: { name: string; description: string; content: string }[] = [
  {
    name: 'Next.js App',
    description: 'Conventions Next.js, App Router, Server Components',
    content: `# Project Guidelines\n\n## Tech Stack\n- Next.js 16 (App Router)\n- TypeScript strict mode\n- Tailwind CSS 4\n- Zustand for state\n\n## Code Style\n- Server Components by default\n- Use 'use client' only for interactivity\n- Server Actions for mutations\n- All request APIs are async\n\n## Architecture\n- app/ for routes\n- components/ for reusable UI\n- lib/ for utilities\n- types/ for TypeScript types`,
  },
  {
    name: 'API Backend',
    description: 'REST conventions, auth patterns, DB conventions',
    content: `# API Backend Guidelines\n\n## Architecture\n- Express/Hono for routing\n- Repository pattern for data access\n- Service layer for business logic\n\n## API Conventions\n- RESTful endpoints\n- JSON request/response\n- Error envelope: { success, data, error }\n- Pagination: { total, page, limit }\n\n## Security\n- JWT authentication\n- Rate limiting on all endpoints\n- Input validation with Zod\n- Parameterized SQL queries`,
  },
  {
    name: 'Python ML',
    description: 'Data science, model training, notebooks',
    content: `# Python ML Guidelines\n\n## Stack\n- Python 3.12+\n- PyTorch / TensorFlow\n- pandas, numpy, scikit-learn\n- Jupyter notebooks for exploration\n\n## Code Style\n- PEP 8 compliance\n- Type hints everywhere\n- Docstrings for public functions\n- pytest for testing\n\n## Data\n- Data versioning with DVC\n- Feature engineering in pipelines\n- Reproducible experiments`,
  },
  {
    name: 'Roblox / Luau',
    description: 'Game dev, Luau style, Roblox conventions',
    content: `# Roblox Project Guidelines\n\n## Stack\n- Roblox Studio\n- Luau (typed Lua)\n- Rojo for syncing\n\n## Code Style\n- PascalCase for services/modules\n- camelCase for local variables\n- Strict type annotations\n- No deprecated APIs\n\n## Architecture\n- Server/Client separation\n- RemoteEvents for communication\n- Modules in ReplicatedStorage/ServerStorage`,
  },
];

export function MemoryPage() {
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<MemoryFile[]>([]);

  async function handleScan() {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const config = await invoke<{ homeDir: string }>('get_config');
      const claudeDir = `${config.homeDir}/.claude`;

      // Scan for memory files
      const files: MemoryFile[] = [];

      // Check global CLAUDE.md
      const globalMd = await invoke<string | null>('read_claude_md', { projectPath: config.homeDir });
      if (globalMd !== null) {
        files.push({ name: 'CLAUDE.md (global)', path: `${config.homeDir}/CLAUDE.md`, type: 'claude-md' });
      }

      // Check .claude directory
      files.push({ name: 'settings.json', path: `${claudeDir}/settings.json`, type: 'settings' });

      setScannedFiles(files);
    } catch {
      // Browser fallback — show demo files
      setScannedFiles([
        { name: 'CLAUDE.md (global)', path: '~/.claude/CLAUDE.md', type: 'claude-md' },
        { name: 'settings.json', path: '~/.claude/settings.json', type: 'settings' },
        { name: 'CLAUDE.md', path: '~/projects/my-app/CLAUDE.md', type: 'claude-md', projectName: 'my-app' },
      ]);
    }
  }

  function handleSelectFile(file: MemoryFile) {
    setSelectedFile(file);
    // In real app, would read file content via Tauri
    setEditorContent(`# ${file.name}\n\nChargement du contenu...`);
  }

  function handleApplyTemplate(template: typeof MEMORY_TEMPLATES[0]) {
    setEditorContent(template.content);
    setShowTemplates(false);
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left panel — File explorer */}
      <div className="w-72 shrink-0 space-y-4">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Memory</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Fichiers CLAUDE.md et mémoire
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleScan}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm flex-1"
            style={{ background: 'var(--accent-primary)', color: 'white' }}>
            <FolderOpen size={14} /> Scanner
          </button>
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            <FileText size={14} /> Templates
          </button>
        </div>

        {/* File tree */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          {scannedFiles.length === 0 ? (
            <div className="p-4 text-center text-small" style={{ color: 'var(--text-tertiary)' }}>
              Cliquez sur "Scanner" pour découvrir les fichiers de mémoire
            </div>
          ) : (
            <div className="py-1">
              {scannedFiles.map((file) => (
                <button key={file.path} onClick={() => handleSelectFile(file)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                  style={{
                    background: selectedFile?.path === file.path ? 'var(--accent-primary-glow)' : 'transparent',
                    color: selectedFile?.path === file.path ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}>
                  <File size={14} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{file.name}</div>
                    {file.projectName && (
                      <div className="text-xs truncate" style={{ color: 'var(--text-ghost)' }}>{file.projectName}</div>
                    )}
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--text-ghost)' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Templates panel */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-xl border p-3 space-y-2"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Templates</div>
                {MEMORY_TEMPLATES.map((t) => (
                  <button key={t.name} onClick={() => handleApplyTemplate(t)}
                    className="w-full text-left rounded-lg px-3 py-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-ghost)' }}>{t.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel — Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile || editorContent ? (
          <div className="flex flex-col h-full rounded-xl border overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span className="text-sm mono" style={{ color: 'var(--text-primary)' }}>
                  {selectedFile?.name ?? 'Nouveau fichier'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: showPreview ? 'var(--accent-primary-glow)' : 'transparent',
                    color: showPreview ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  }}>
                  {showPreview ? <Eye size={12} /> : <Code size={12} />}
                  {showPreview ? 'Preview' : 'Code'}
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{ color: 'var(--accent-success)' }}>
                  <Save size={12} /> Save
                </button>
              </div>
            </div>

            {/* Editor content */}
            <div className="flex-1 flex min-h-0">
              <textarea value={editorContent} onChange={(e) => setEditorContent(e.target.value)}
                className={`${showPreview ? 'w-1/2 border-r' : 'w-full'} h-full p-4 text-sm bg-transparent outline-none resize-none mono`}
                style={{
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                  lineHeight: 1.6,
                }}
                spellCheck={false} />
              {showPreview && (
                <div className="w-1/2 h-full p-4 overflow-y-auto text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {editorContent.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-h1 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-h2 mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-h3 mb-1 mt-3" style={{ color: 'var(--text-primary)' }}>{line.slice(4)}</h3>;
                    if (line.startsWith('- ')) return <div key={i} className="pl-4">• {line.slice(2)}</div>;
                    if (line.trim() === '') return <div key={i} className="h-2" />;
                    return <div key={i}>{line}</div>;
                  })}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-ghost)' }}>
              <span>{editorContent.split('\n').length} lignes</span>
              <span>~{Math.ceil(editorContent.length / 4)} tokens estimés</span>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-12 text-center flex-1 flex flex-col items-center justify-center"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--accent-cyan)' }}>
              <Brain size={28} />
            </div>
            <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>Memory Explorer</h3>
            <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
              Scannez vos projets ou choisissez un template pour commencer.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
