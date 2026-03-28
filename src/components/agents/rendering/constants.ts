import type { WorldTile } from '@/types/agentWorld';

// World dimensions in world units
export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;

// Agent rendering
export const AGENT_RADIUS = 20;
export const AGENT_LABEL_OFFSET = 32;
export const BUBBLE_MAX_WIDTH = 180;
export const BUBBLE_PADDING = 8;
export const BUBBLE_OFFSET_Y = -40;

// Grid
export const GRID_SIZE = 40;

// Timing
export const IDLE_WANDER_CHANCE = 0.005;
export const WANDER_RADIUS = 120;
export const MESSAGE_DURATION = 5;
export const PARTICLE_SPAWN_INTERVAL = 0.15;

// Colors mapped to agent types by name keyword
export const AGENT_COLOR_MAP: Record<string, { color: string; emoji: string }> = {
  architect: { color: '#00d4ff', emoji: '🏗️' },
  speed: { color: '#00ff88', emoji: '⚡' },
  coder: { color: '#00ff88', emoji: '⚡' },
  reviewer: { color: '#8b5cf6', emoji: '🔍' },
  debugger: { color: '#ff3366', emoji: '🐛' },
  tester: { color: '#ffb800', emoji: '🧪' },
  designer: { color: '#ff6b2b', emoji: '🎨' },
  writer: { color: '#00d4ff', emoji: '📝' },
  planner: { color: '#8b5cf6', emoji: '🎯' },
  security: { color: '#ff3366', emoji: '🛡️' },
};

// Fallback colors for agents not matching any keyword
export const FALLBACK_COLORS = [
  { color: '#00d4ff', emoji: '🤖' },
  { color: '#00ff88', emoji: '🧠' },
  { color: '#8b5cf6', emoji: '💡' },
  { color: '#ffb800', emoji: '🔧' },
  { color: '#ff6b2b', emoji: '📊' },
  { color: '#ff3366', emoji: '🎯' },
];

// State ring colors
export const STATE_COLORS: Record<string, string> = {
  idle: '#00d4ff',
  walking: '#00ff88',
  working: '#3b82f6',
  thinking: '#8b5cf6',
  talking: '#ffb800',
  error: '#ff3366',
  sleeping: '#71717a',
};

// World furniture layout
export const WORLD_TILES: WorldTile[] = [
  // Desks cluster - top left
  { x: 120, y: 100, type: 'desk' },
  { x: 200, y: 100, type: 'screen' },
  { x: 120, y: 180, type: 'desk' },
  { x: 200, y: 180, type: 'screen' },
  // Server rack area - top right
  { x: 900, y: 80, type: 'server' },
  { x: 960, y: 80, type: 'server' },
  { x: 1020, y: 80, type: 'server' },
  // Plants for decoration
  { x: 60, y: 60, type: 'plant' },
  { x: 1100, y: 60, type: 'plant' },
  { x: 60, y: 700, type: 'plant' },
  { x: 1100, y: 700, type: 'plant' },
  { x: 580, y: 380, type: 'plant' },
  // Coffee area - bottom left
  { x: 100, y: 600, type: 'coffee' },
  { x: 160, y: 600, type: 'desk' },
  // Bookshelf area - right side
  { x: 1050, y: 300, type: 'bookshelf' },
  { x: 1050, y: 360, type: 'bookshelf' },
  { x: 1050, y: 420, type: 'bookshelf' },
  // Center desks
  { x: 450, y: 300, type: 'desk' },
  { x: 530, y: 300, type: 'screen' },
  { x: 450, y: 380, type: 'desk' },
  { x: 530, y: 380, type: 'screen' },
  // Bottom desks
  { x: 600, y: 600, type: 'desk' },
  { x: 680, y: 600, type: 'screen' },
  { x: 760, y: 600, type: 'desk' },
  // Walls (decorative borders)
  { x: 0, y: 0, type: 'wall' },
];
