import { ZoomIn, ZoomOut, Pause, Play, RotateCcw, Users } from 'lucide-react';
import { useAgentWorldStore } from '@/stores/agentWorldStore';

export function WorldControls() {
  const zoom = useAgentWorldStore((s) => s.zoom);
  const isPaused = useAgentWorldStore((s) => s.isPaused);
  const agentCount = useAgentWorldStore((s) => s.agents.length);
  const setZoom = useAgentWorldStore((s) => s.setZoom);
  const togglePause = useAgentWorldStore((s) => s.togglePause);

  function handleResetCamera() {
    useAgentWorldStore.setState({
      cameraX: 0,
      cameraY: 0,
      zoom: 1,
    });
  }

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(17, 17, 19, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    color: 'var(--text-2)',
    cursor: 'pointer',
  };

  return (
    <div
      className="absolute top-3 left-3 flex items-center gap-1.5 rounded-xl px-1.5 py-1"
      style={{
        background: 'rgba(17, 17, 19, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        zIndex: 15,
      }}
    >
      <button
        onClick={() => setZoom(zoom + 0.15)}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={buttonStyle}
        title="Zoom +"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={() => setZoom(zoom - 0.15)}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={buttonStyle}
        title="Zoom -"
      >
        <ZoomOut size={14} />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.07)' }} />

      <button
        onClick={togglePause}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{
          ...buttonStyle,
          color: isPaused ? 'var(--amber)' : 'var(--text-2)',
        }}
        title={isPaused ? 'Reprendre' : 'Pause'}
      >
        {isPaused ? <Play size={14} /> : <Pause size={14} />}
      </button>

      <button
        onClick={handleResetCamera}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={buttonStyle}
        title="Reset camera"
      >
        <RotateCcw size={14} />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.07)' }} />

      <div className="flex items-center gap-1.5 px-2 text-small" style={{ color: 'var(--text-3)' }}>
        <Users size={12} />
        <span className="mono">{agentCount}</span>
      </div>

      <div className="px-2 text-small mono" style={{ color: 'var(--text-4)' }}>
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
