import type { WorldTile } from '@/types/agentWorld';
import { GRID_SIZE, WORLD_WIDTH, WORLD_HEIGHT, WORLD_TILES } from './constants';

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  zoom: number,
  canvasW: number,
  canvasH: number,
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;

  const scaledGrid = GRID_SIZE * zoom;
  const offsetX = (-cameraX * zoom) % scaledGrid;
  const offsetY = (-cameraY * zoom) % scaledGrid;

  for (let x = offsetX; x < canvasW; x += scaledGrid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasH);
    ctx.stroke();
  }
  for (let y = offsetY; y < canvasH; y += scaledGrid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasW, y);
    ctx.stroke();
  }
}

function drawFloor(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  zoom: number,
  canvasW: number,
  canvasH: number,
): void {
  // Dark background
  ctx.fillStyle = '#0a0a0b';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Subtle dot pattern
  const dotSpacing = 32 * zoom;
  const offsetX = (-cameraX * zoom) % dotSpacing;
  const offsetY = (-cameraY * zoom) % dotSpacing;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let x = offsetX; x < canvasW; x += dotSpacing) {
    for (let y = offsetY; y < canvasH; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGrid(ctx, cameraX, cameraY, zoom, canvasW, canvasH);
}

function worldToScreen(
  wx: number,
  wy: number,
  cameraX: number,
  cameraY: number,
  zoom: number,
): { sx: number; sy: number } {
  return {
    sx: (wx - cameraX) * zoom,
    sy: (wy - cameraY) * zoom,
  };
}

function drawDesk(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  const w = 56 * zoom;
  const h = 32 * zoom;
  // Desk surface
  ctx.fillStyle = '#1a1a1f';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 4 * zoom);
  ctx.fill();
  ctx.stroke();
}

function drawScreen(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  const w = 24 * zoom;
  const h = 18 * zoom;
  // Monitor
  ctx.fillStyle = '#111115';
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 2 * zoom);
  ctx.fill();
  ctx.stroke();
  // Screen glow
  ctx.fillStyle = 'rgba(0, 212, 255, 0.06)';
  ctx.beginPath();
  ctx.roundRect(sx - w / 2 + 2 * zoom, sy - h / 2 + 2 * zoom, w - 4 * zoom, h - 4 * zoom, 1 * zoom);
  ctx.fill();
}

function drawPlant(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  // Pot
  ctx.fillStyle = '#2a1a12';
  ctx.beginPath();
  ctx.roundRect(sx - 8 * zoom, sy, 16 * zoom, 12 * zoom, 2 * zoom);
  ctx.fill();
  // Leaves
  ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
  ctx.beginPath();
  ctx.arc(sx, sy - 6 * zoom, 10 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
  ctx.beginPath();
  ctx.arc(sx - 5 * zoom, sy - 10 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

function drawServer(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  const w = 40 * zoom;
  const h = 56 * zoom;
  ctx.fillStyle = '#14141a';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 3 * zoom);
  ctx.fill();
  ctx.stroke();
  // LED lights
  for (let i = 0; i < 4; i++) {
    const ledY = sy - h / 2 + 10 * zoom + i * 12 * zoom;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 212, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(sx - w / 2 + 8 * zoom, ledY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCoffee(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  // Machine body
  ctx.fillStyle = '#1a1a20';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sx - 14 * zoom, sy - 18 * zoom, 28 * zoom, 36 * zoom, 4 * zoom);
  ctx.fill();
  ctx.stroke();
  // Cup
  ctx.fillStyle = 'rgba(255, 184, 0, 0.2)';
  ctx.beginPath();
  ctx.arc(sx, sy + 6 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

function drawBookshelf(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number): void {
  const w = 48 * zoom;
  const h = 16 * zoom;
  ctx.fillStyle = '#1c1610';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 2 * zoom);
  ctx.fill();
  ctx.stroke();
  // Books
  const bookColors = ['rgba(139,92,246,0.3)', 'rgba(0,212,255,0.3)', 'rgba(255,184,0,0.3)', 'rgba(255,51,102,0.3)'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(sx - w / 2 + 4 * zoom + i * 11 * zoom, sy - h / 2 + 2 * zoom, 8 * zoom, h - 4 * zoom);
  }
}

function drawTile(ctx: CanvasRenderingContext2D, tile: WorldTile, cameraX: number, cameraY: number, zoom: number): void {
  const { sx, sy } = worldToScreen(tile.x, tile.y, cameraX, cameraY, zoom);

  switch (tile.type) {
    case 'desk':
      drawDesk(ctx, sx, sy, zoom);
      break;
    case 'screen':
      drawScreen(ctx, sx, sy, zoom);
      break;
    case 'plant':
      drawPlant(ctx, sx, sy, zoom);
      break;
    case 'server':
      drawServer(ctx, sx, sy, zoom);
      break;
    case 'coffee':
      drawCoffee(ctx, sx, sy, zoom);
      break;
    case 'bookshelf':
      drawBookshelf(ctx, sx, sy, zoom);
      break;
    default:
      break;
  }
}

// Decorative world border
function drawWorldBorder(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, zoom: number): void {
  const { sx: x0, sy: y0 } = worldToScreen(0, 0, cameraX, cameraY, zoom);
  const w = WORLD_WIDTH * zoom;
  const h = WORLD_HEIGHT * zoom;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(x0, y0, w, h);
  ctx.setLineDash([]);
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cameraX: number,
  cameraY: number,
  zoom: number,
): void {
  drawFloor(ctx, cameraX, cameraY, zoom, canvasW, canvasH);
  drawWorldBorder(ctx, cameraX, cameraY, zoom);

  for (const tile of WORLD_TILES) {
    if (tile.type === 'wall' || tile.type === 'floor') continue;
    drawTile(ctx, tile, cameraX, cameraY, zoom);
  }
}

export { worldToScreen };
