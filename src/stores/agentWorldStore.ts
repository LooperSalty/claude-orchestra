import { create } from 'zustand';
import type { AgentSprite, AgentVisualState, ChatMessage } from '@/types/agentWorld';
import type { AgentConfig } from '@/types/agent';
import {
  AGENT_COLOR_MAP,
  FALLBACK_COLORS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WANDER_RADIUS,
  IDLE_WANDER_CHANCE,
  MESSAGE_DURATION,
  PARTICLE_SPAWN_INTERVAL,
} from '@/components/agents/rendering/constants';

function resolveColorEmoji(name: string, index: number): { color: string; emoji: string } {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(AGENT_COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createSprite(config: AgentConfig, index: number): AgentSprite {
  const margin = 80;
  const x = randomInRange(margin, WORLD_WIDTH - margin);
  const y = randomInRange(margin, WORLD_HEIGHT - margin);
  const { color, emoji } = resolveColorEmoji(config.name, index);

  return {
    id: config.id,
    name: config.name,
    x,
    y,
    targetX: x,
    targetY: y,
    speed: 60 + Math.random() * 40,
    state: 'idle',
    color,
    emoji,
    message: null,
    messageTimer: 0,
    direction: 'down',
    bobOffset: Math.random() * Math.PI * 2,
    particleTimer: 0,
  };
}

function pickRandomState(): AgentVisualState {
  const states: AgentVisualState[] = ['idle', 'working', 'thinking', 'idle', 'idle', 'sleeping'];
  return states[Math.floor(Math.random() * states.length)];
}

const RANDOM_MESSAGES = [
  'Analyzing codebase...',
  'Refactoring module...',
  'Running tests...',
  'Reviewing PR #42',
  'Optimizing queries',
  'Fixing bug in auth',
  'Deploying changes...',
  'Writing documentation',
  'Scanning for issues',
  'Building feature...',
];

interface AgentWorldState {
  agents: AgentSprite[];
  selectedAgent: string | null;
  chatMessages: Record<string, ChatMessage[]>;
  isPaused: boolean;
  zoom: number;
  cameraX: number;
  cameraY: number;
}

interface AgentWorldActions {
  initAgents: (configs: AgentConfig[]) => void;
  selectAgent: (id: string | null) => void;
  sendMessage: (agentId: string, message: string) => void;
  addAgentMessage: (agentId: string, message: string) => void;
  togglePause: () => void;
  setZoom: (zoom: number) => void;
  moveCamera: (dx: number, dy: number) => void;
  updateAgentState: (id: string, state: AgentVisualState) => void;
  tickAgents: (dt: number) => void;
  centerOnAgent: (id: string, canvasW: number, canvasH: number) => void;
}

export const useAgentWorldStore = create<AgentWorldState & AgentWorldActions>((set, get) => ({
  agents: [],
  selectedAgent: null,
  chatMessages: {},
  isPaused: false,
  zoom: 1,
  cameraX: 0,
  cameraY: 0,

  initAgents: (configs) => {
    const existing = get().agents;
    // Only re-init if agent count changed
    if (existing.length === configs.length && existing.every((a, i) => a.id === configs[i].id)) return;

    const sprites = configs.map((c, i) => createSprite(c, i));
    set({ agents: sprites });
  },

  selectAgent: (id) => set({ selectedAgent: id }),

  sendMessage: (agentId, message) => {
    const state = get();
    const existing = state.chatMessages[agentId] ?? [];
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      agentId,
      agentName: 'You',
      content: message,
      timestamp: Date.now(),
      isUser: true,
    };

    // Update chat and show message on agent
    const newMessages = { ...state.chatMessages, [agentId]: [...existing, userMsg] };
    set({ chatMessages: newMessages });

    // Agent "replies" after a short delay
    setTimeout(() => {
      const s = get();
      const agent = s.agents.find((a) => a.id === agentId);
      if (!agent) return;

      const reply = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      get().addAgentMessage(agentId, reply);
    }, 800 + Math.random() * 1200);
  },

  addAgentMessage: (agentId, message) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    if (!agent) return;

    const chatMsg: ChatMessage = {
      id: crypto.randomUUID(),
      agentId,
      agentName: agent.name,
      content: message,
      timestamp: Date.now(),
      isUser: false,
    };

    const existing = state.chatMessages[agentId] ?? [];
    set({
      chatMessages: { ...state.chatMessages, [agentId]: [...existing, chatMsg] },
      agents: state.agents.map((a) =>
        a.id === agentId
          ? { ...a, message, messageTimer: MESSAGE_DURATION, state: 'talking' as const }
          : a,
      ),
    });
  },

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  setZoom: (zoom) => set({ zoom: Math.max(0.4, Math.min(2.5, zoom)) }),

  moveCamera: (dx, dy) =>
    set((s) => ({ cameraX: s.cameraX + dx, cameraY: s.cameraY + dy })),

  updateAgentState: (id, state) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, state } : a)),
    })),

  centerOnAgent: (id, canvasW, canvasH) => {
    const agent = get().agents.find((a) => a.id === id);
    if (!agent) return;
    const zoom = get().zoom;
    set({
      cameraX: agent.x - canvasW / (2 * zoom),
      cameraY: agent.y - canvasH / (2 * zoom),
    });
  },

  tickAgents: (dt) => {
    if (get().isPaused) return;

    set((state) => ({
      agents: state.agents.map((agent) => {
        let { x, y, targetX, targetY, state: agentState, messageTimer, particleTimer, direction } = agent;

        // Decrease message timer
        messageTimer = Math.max(0, messageTimer - dt);
        if (messageTimer <= 0 && agentState === 'talking') {
          agentState = 'idle';
        }

        // Particle timer
        particleTimer = Math.max(0, particleTimer - dt);

        // Movement toward target
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
          const moveAmount = agent.speed * dt;
          const ratio = Math.min(moveAmount / dist, 1);
          x = x + dx * ratio;
          y = y + dy * ratio;

          if (agentState !== 'talking' && agentState !== 'error') {
            agentState = 'walking';
          }

          // Direction
          if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
          } else {
            direction = dy > 0 ? 'down' : 'up';
          }
        } else if (agentState === 'walking') {
          agentState = 'idle';
        }

        // Random behavior for idle agents
        let newTargetX = targetX;
        let newTargetY = targetY;
        let newState = agentState;

        if (agentState === 'idle' && Math.random() < IDLE_WANDER_CHANCE) {
          newTargetX = Math.max(40, Math.min(WORLD_WIDTH - 40,
            x + (Math.random() - 0.5) * WANDER_RADIUS * 2));
          newTargetY = Math.max(40, Math.min(WORLD_HEIGHT - 40,
            y + (Math.random() - 0.5) * WANDER_RADIUS * 2));
        }

        // Occasionally change state
        if (agentState === 'idle' && Math.random() < 0.001) {
          newState = pickRandomState();
          if (newState === 'working' || newState === 'thinking') {
            // Show a random message sometimes
            if (Math.random() < 0.4) {
              const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
              return {
                ...agent,
                x, y,
                targetX: newTargetX,
                targetY: newTargetY,
                state: newState,
                direction,
                messageTimer: MESSAGE_DURATION,
                message: msg,
                particleTimer: PARTICLE_SPAWN_INTERVAL,
              };
            }
          }
        }

        return {
          ...agent,
          x, y,
          targetX: newTargetX,
          targetY: newTargetY,
          state: newState,
          direction,
          messageTimer,
          message: messageTimer <= 0 ? null : agent.message,
          particleTimer,
        };
      }),
    }));
  },
}));
