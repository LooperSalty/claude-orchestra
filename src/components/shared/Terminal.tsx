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

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      theme: {
        background: '#0a0a0b',
        foreground: '#d4d4d4',
        cursor: '#00d4ff',
        selectionBackground: 'rgba(0, 212, 255, 0.2)',
        black: '#050506',
        red: '#ff3366',
        green: '#00ff88',
        yellow: '#ffb800',
        blue: '#00d4ff',
        magenta: '#8b5cf6',
        cyan: '#00d4ff',
        white: '#d4d4d4',
        brightBlack: '#3f3f46',
        brightRed: '#ff5580',
        brightGreen: '#33ffa0',
        brightYellow: '#ffc933',
        brightBlue: '#33dfff',
        brightMagenta: '#a78bfa',
        brightCyan: '#33dfff',
        brightWhite: '#fafaf9',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);

    requestAnimationFrame(() => fitAddon.fit());

    // Welcome
    term.writeln('');
    term.writeln('  \x1b[1;36m⬢\x1b[0m \x1b[1mClaude Orchestra\x1b[0m \x1b[90m— Terminal\x1b[0m');
    term.writeln('  \x1b[90m─────────────────────────────\x1b[0m');
    term.writeln('');

    if (onData) {
      term.onData(onData);
    }

    termRef.current = term;

    // Listen to session output via CustomEvent (bridged from Tauri Channel in useSession)
    const eventName = `session-output-${sessionId}`;
    function handleOutput(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.content) {
        if (detail.log_type === 'stderr') {
          term.write(`\x1b[31m${detail.content}\x1b[0m`);
        } else {
          term.write(detail.content);
        }
      }
    }
    window.addEventListener(eventName, handleOutput);

    // Resize
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => fitAddon.fit());
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener(eventName, handleOutput);
      term.dispose();
    };
  }, [sessionId, onData]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[200px] rounded-xl overflow-hidden ${className}`}
      style={{ background: '#0a0a0b' }}
    />
  );
}
