import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  sessionId: string;
  onData?: (data: string) => void;
  className?: string;
}

export function Terminal({ sessionId, onData, className = '' }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      theme: {
        background: '#0a0a12',
        foreground: '#e8e9f0',
        cursor: '#4f7df9',
        selectionBackground: 'rgba(79, 125, 249, 0.3)',
        black: '#06060a',
        red: '#ff4d6a',
        green: '#00e5a0',
        yellow: '#ffb224',
        blue: '#4f7df9',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e8e9f0',
        brightBlack: '#555873',
        brightRed: '#ff6b84',
        brightGreen: '#33edb6',
        brightYellow: '#ffc24d',
        brightBlue: '#6b93ff',
        brightMagenta: '#bfa4fb',
        brightCyan: '#4de0f0',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    // Welcome message
    term.writeln('\x1b[1;34m╔══════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m  \x1b[1;37mClaude Orchestra\x1b[0m — Session Terminal  \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m╚══════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    // Handle user input
    if (onData) {
      term.onData(onData);
    }

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Listen for Tauri events for this session
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await listen<{ content: string; log_type: string }>(
          `session-output-${sessionId}`,
          (event) => {
            const { content, log_type } = event.payload;
            if (log_type === 'stderr') {
              term.write(`\x1b[31m${content}\x1b[0m`);
            } else {
              term.write(content);
            }
          }
        );
      } catch {
        // Browser mode — no Tauri events
      }
    })();

    // Resize observer
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      unlisten?.();
      term.dispose();
    };
  }, [sessionId, onData]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[200px] rounded-lg overflow-hidden ${className}`}
      style={{ background: '#0a0a12' }}
    />
  );
}

// Helper to write to a terminal from outside
export function writeToTerminal(term: XTerm | null, data: string) {
  term?.write(data);
}
