import { useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/stores/agentStore';
import { useAgentWorldStore } from '@/stores/agentWorldStore';
import { renderWorld } from './rendering/worldRenderer';
import {
  renderAgents,
  renderParticles,
  updateParticles,
  spawnWorkingParticles,
  spawnErrorParticles,
  hitTestAgent,
} from './rendering/agentRenderer';
import { AgentChatPanel } from './AgentChatPanel';
import { WorldControls } from './WorldControls';
import type { Particle } from '@/types/agentWorld';

export function AgentWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef({ x: 0, y: 0, time: 0 });

  const configAgents = useAgentStore((s) => s.agents);
  const initAgents = useAgentWorldStore((s) => s.initAgents);
  const selectedAgent = useAgentWorldStore((s) => s.selectedAgent);

  // Initialize agents from config
  useEffect(() => {
    if (configAgents.length > 0) {
      initAgents(configAgents);
    }
  }, [configAgents, initAgents]);

  // Resize canvas to fill container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Game loop
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    lastTimeRef.current = performance.now();

    function gameLoop(timestamp: number) {
      const c = ctxRef.current;
      if (!c) return;

      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const store = useAgentWorldStore.getState();
      const { cameraX, cameraY, zoom, selectedAgent: selId } = store;

      store.tickAgents(dt);

      particlesRef.current = updateParticles(particlesRef.current, dt);

      const updatedAgents = useAgentWorldStore.getState().agents;
      for (const agent of updatedAgents) {
        if (agent.state === 'working' && agent.particleTimer <= 0) {
          particlesRef.current.push(...spawnWorkingParticles(agent, zoom));
        }
        if (agent.state === 'error' && Math.random() < 0.02) {
          particlesRef.current.push(...spawnErrorParticles(agent, zoom));
        }
      }

      const container = containerRef.current;
      if (!container) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      const rect = container.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;

      c.save();
      c.clearRect(0, 0, canvasW, canvasH);

      renderWorld(c, canvasW, canvasH, cameraX, cameraY, zoom);
      renderAgents(c, updatedAgents, selId, cameraX, cameraY, zoom, timestamp / 1000);
      renderParticles(c, particlesRef.current, cameraX, cameraY, zoom);

      c.restore();

      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resizeCanvas]);

  // Screen to world coordinate conversion
  const screenToWorld = useCallback((clientX: number, clientY: number): { wx: number; wy: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { wx: 0, wy: 0 };
    const rect = canvas.getBoundingClientRect();
    const { cameraX, cameraY, zoom } = useAgentWorldStore.getState();
    return {
      wx: (clientX - rect.left) / zoom + cameraX,
      wy: (clientY - rect.top) / zoom + cameraY,
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = false;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    clickStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // If moved more than 4px, consider it dragging
    const totalDx = e.clientX - clickStartRef.current.x;
    const totalDy = e.clientY - clickStartRef.current.y;
    if (Math.abs(totalDx) > 4 || Math.abs(totalDy) > 4) {
      isDraggingRef.current = true;
    }

    const { zoom } = useAgentWorldStore.getState();
    useAgentWorldStore.getState().moveCamera(-dx / zoom, -dy / zoom);
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) return;

    const { wx, wy } = screenToWorld(e.clientX, e.clientY);
    const agents = useAgentWorldStore.getState().agents;
    const hit = hitTestAgent(agents, wx, wy);

    if (hit) {
      useAgentWorldStore.getState().selectAgent(hit.id);
    } else {
      useAgentWorldStore.getState().selectAgent(null);
    }
  }, [screenToWorld]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const { wx, wy } = screenToWorld(e.clientX, e.clientY);
    const agents = useAgentWorldStore.getState().agents;
    const hit = hitTestAgent(agents, wx, wy);

    if (hit) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        useAgentWorldStore.getState().centerOnAgent(hit.id, rect.width, rect.height);
      }
      useAgentWorldStore.getState().selectAgent(hit.id);
    }
  }, [screenToWorld]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { zoom, setZoom } = useAgentWorldStore.getState();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(zoom + delta);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-xl"
      style={{ background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'default', display: 'block' }}
      />

      <WorldControls />

      <AnimatePresence>
        {selectedAgent && <AgentChatPanel key="chat-panel" />}
      </AnimatePresence>
    </div>
  );
}
