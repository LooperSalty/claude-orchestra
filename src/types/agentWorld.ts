export type AgentVisualState =
  | 'idle'
  | 'walking'
  | 'working'
  | 'thinking'
  | 'talking'
  | 'error'
  | 'sleeping';

export interface AgentSprite {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  state: AgentVisualState;
  color: string;
  emoji: string;
  message: string | null;
  messageTimer: number;
  direction: 'up' | 'down' | 'left' | 'right';
  bobOffset: number;
  particleTimer: number;
}

export type TileType =
  | 'floor'
  | 'desk'
  | 'plant'
  | 'server'
  | 'screen'
  | 'coffee'
  | 'bookshelf'
  | 'wall';

export interface WorldTile {
  x: number;
  y: number;
  type: TileType;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  isUser: boolean;
}
