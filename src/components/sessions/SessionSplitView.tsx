import { SessionTerminal } from './SessionTerminal';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
export function SessionSplitView() {
  const sessions = useSessionStore((s) => s.sessions);
  const runningSessions = sessions.filter((s) => s.status === 'running');
  const { splitLayout } = useUIStore();

  if (runningSessions.length === 0) return null;

  const visibleSessions = runningSessions.slice(0, splitLayout === 'quad' ? 4 : splitLayout === 'single' ? 1 : 2);

  function getGridClass() {
    switch (splitLayout) {
      case 'horizontal': return 'grid-rows-2';
      case 'vertical': return 'grid-cols-2';
      case 'quad': return 'grid-cols-2 grid-rows-2';
      default: return '';
    }
  }

  return (
    <div className={`grid gap-2 h-full ${getGridClass()}`}>
      {visibleSessions.map((session) => (
        <SessionTerminal
          key={session.id}
          session={session}
          onClose={() => {
            // Close terminal panel, don't kill session
          }}
        />
      ))}
    </div>
  );
}
