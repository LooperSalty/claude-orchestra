import type { AgentSprite, Particle } from '@/types/agentWorld';
import { AGENT_RADIUS, AGENT_LABEL_OFFSET, BUBBLE_MAX_WIDTH, BUBBLE_PADDING, BUBBLE_OFFSET_Y, STATE_COLORS } from './constants';
import { worldToScreen } from './worldRenderer';

// ---- Agent body ----

function drawAgentBody(
  ctx: CanvasRenderingContext2D,
  agent: AgentSprite,
  sx: number,
  sy: number,
  zoom: number,
  isSelected: boolean,
  time: number,
): void {
  const r = AGENT_RADIUS * zoom;
  const bobY = agent.state === 'idle' ? Math.sin(agent.bobOffset + time * 2) * 3 * zoom : 0;
  const shakeX = agent.state === 'error' ? Math.sin(time * 30) * 3 * zoom : 0;
  const drawX = sx + shakeX;
  const drawY = sy + bobY;

  // State ring (outer glow)
  const stateColor = STATE_COLORS[agent.state] ?? STATE_COLORS.idle;
  const ringAlpha = agent.state === 'idle' ? 0.3 + Math.sin(time * 2) * 0.15 : 0.6;

  ctx.beginPath();
  ctx.arc(drawX, drawY, r + 4 * zoom, 0, Math.PI * 2);
  ctx.strokeStyle = stateColor;
  ctx.globalAlpha = ringAlpha;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Selection highlight
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(drawX, drawY, r + 8 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 4 * zoom]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Main circle body
  ctx.beginPath();
  ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(drawX, drawY - r * 0.3, 0, drawX, drawY, r);
  gradient.addColorStop(0, agent.color + 'cc');
  gradient.addColorStop(1, agent.color + '66');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Inner shadow
  ctx.beginPath();
  ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Emoji avatar
  ctx.font = `${Math.round(20 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(agent.emoji, drawX, drawY);

  // Name label
  ctx.font = `500 ${Math.round(10 * zoom)}px 'DM Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#d4d4d4';
  ctx.fillText(agent.name, drawX, drawY + AGENT_LABEL_OFFSET * zoom);

  // State-specific overlay text
  if (agent.state === 'sleeping') {
    drawSleepingZzz(ctx, drawX, drawY, zoom, time);
  }
  if (agent.state === 'thinking') {
    drawThinkingDots(ctx, drawX, drawY, zoom, time);
  }
}

function drawSleepingZzz(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  zoom: number,
  time: number,
): void {
  ctx.font = `bold ${Math.round(12 * zoom)}px sans-serif`;
  ctx.fillStyle = '#71717a';
  const baseY = sy - 30 * zoom;
  for (let i = 0; i < 3; i++) {
    const floatY = baseY - i * 14 * zoom - (Math.sin(time * 1.5 + i) * 4 * zoom);
    const floatX = sx + 14 * zoom + i * 6 * zoom;
    ctx.globalAlpha = 0.6 - i * 0.15;
    ctx.font = `bold ${Math.round((10 + i * 2) * zoom)}px sans-serif`;
    ctx.fillText('z', floatX, floatY);
  }
  ctx.globalAlpha = 1;
}

function drawThinkingDots(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  zoom: number,
  time: number,
): void {
  const baseY = sy - 34 * zoom;
  for (let i = 0; i < 3; i++) {
    const dotAlpha = 0.3 + 0.7 * Math.max(0, Math.sin(time * 3 - i * 0.8));
    ctx.globalAlpha = dotAlpha;
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(sx - 8 * zoom + i * 8 * zoom, baseY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- Speech bubble ----

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  agent: AgentSprite,
  sx: number,
  sy: number,
  zoom: number,
): void {
  if (!agent.message || agent.messageTimer <= 0) return;

  const fadeAlpha = Math.min(1, agent.messageTimer);
  ctx.globalAlpha = fadeAlpha;

  const fontSize = Math.round(10 * zoom);
  ctx.font = `400 ${fontSize}px 'DM Sans', sans-serif`;

  const maxW = BUBBLE_MAX_WIDTH * zoom;
  const padding = BUBBLE_PADDING * zoom;
  const truncated = agent.message.length > 120 ? agent.message.slice(0, 117) + '...' : agent.message;
  const lines = wrapText(ctx, truncated, maxW - padding * 2);

  const lineHeight = fontSize * 1.4;
  const bubbleW = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + padding * 2);
  const bubbleH = lines.length * lineHeight + padding * 2;
  const bubbleX = sx - bubbleW / 2;
  const bubbleY = sy + BUBBLE_OFFSET_Y * zoom - bubbleH;

  // Bubble background
  ctx.fillStyle = 'rgba(250, 250, 249, 0.95)';
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 6 * zoom);
  ctx.fill();

  // Pointer triangle
  ctx.beginPath();
  ctx.moveTo(sx - 6 * zoom, bubbleY + bubbleH);
  ctx.lineTo(sx, bubbleY + bubbleH + 6 * zoom);
  ctx.lineTo(sx + 6 * zoom, bubbleY + bubbleH);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.fillStyle = '#18181b';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], bubbleX + padding, bubbleY + padding + i * lineHeight);
  }

  ctx.textAlign = 'center';
  ctx.globalAlpha = 1;
}

// ---- Particles ----

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

export function spawnWorkingParticles(agent: AgentSprite, zoom: number): Particle[] {
  const count = 2;
  const result: Particle[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      x: agent.x + (Math.random() - 0.5) * 30,
      y: agent.y - 20 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 40,
      vy: -20 - Math.random() * 30,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1,
      color: '#3b82f6',
      size: 2 * zoom,
    });
  }
  return result;
}

export function spawnErrorParticles(agent: AgentSprite, zoom: number): Particle[] {
  return [{
    x: agent.x + (Math.random() - 0.5) * 20,
    y: agent.y - 30,
    vx: (Math.random() - 0.5) * 20,
    vy: -15 - Math.random() * 20,
    life: 0.8,
    maxLife: 0.8,
    color: '#ff3366',
    size: 3 * zoom,
  }];
}

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cameraX: number,
  cameraY: number,
  zoom: number,
): void {
  for (const p of particles) {
    const { sx, sy } = worldToScreen(p.x, p.y, cameraX, cameraY, zoom);
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.color === '#ff3366') {
      // Warning triangle for errors
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(sx, sy - s);
      ctx.lineTo(sx - s, sy + s);
      ctx.lineTo(sx + s, sy + s);
      ctx.closePath();
      ctx.fill();
    } else {
      // Sparkle dot for working
      ctx.beginPath();
      ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ---- Main agent render ----

export function renderAgents(
  ctx: CanvasRenderingContext2D,
  agents: readonly AgentSprite[],
  selectedId: string | null,
  cameraX: number,
  cameraY: number,
  zoom: number,
  time: number,
): void {
  // Render agents sorted by y for depth
  const sorted = [...agents].sort((a, b) => a.y - b.y);

  for (const agent of sorted) {
    const bobY = agent.state === 'idle' ? Math.sin(agent.bobOffset + time * 2) * 3 : 0;
    const { sx, sy } = worldToScreen(agent.x, agent.y + bobY, cameraX, cameraY, zoom);

    drawAgentBody(ctx, agent, sx, sy, zoom, agent.id === selectedId, time);
    drawSpeechBubble(ctx, agent, sx, sy, zoom);
  }
}

// ---- Hit testing ----

export function hitTestAgent(
  agents: readonly AgentSprite[],
  worldX: number,
  worldY: number,
): AgentSprite | null {
  // Check in reverse-y order (topmost visually = last rendered)
  const sorted = [...agents].sort((a, b) => b.y - a.y);
  for (const agent of sorted) {
    const dx = worldX - agent.x;
    const dy = worldY - agent.y;
    if (dx * dx + dy * dy <= AGENT_RADIUS * AGENT_RADIUS * 1.5) {
      return agent;
    }
  }
  return null;
}
