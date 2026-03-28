import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  pendingAssistant: Record<string, string>;
}

interface ChatActions {
  addMessage: (sessionId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  appendToAssistant: (sessionId: string, content: string) => void;
  flushAssistant: (sessionId: string) => void;
  getMessages: (sessionId: string) => ChatMessage[];
  clearMessages: (sessionId: string) => void;
}

/** Strip ANSI escape sequences from a string */
function stripAnsi(text: string): string {
  return text.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
}

/** Detect if a line is a system/orchestra message */
function isSystemLine(line: string): boolean {
  const stripped = stripAnsi(line).trim();
  return stripped.startsWith('[Orchestra]') || stripped.startsWith('[ORCHESTRA]');
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  messages: {},
  pendingAssistant: {},

  addMessage: (sessionId, msg) => {
    const message: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] ?? []), message],
      },
    }));
  },

  appendToAssistant: (sessionId, content) => {
    const cleaned = stripAnsi(content);
    if (!cleaned.trim()) return;

    // Check for system lines
    const lines = cleaned.split('\n');
    for (const line of lines) {
      if (isSystemLine(line)) {
        // Flush any pending assistant content first
        get().flushAssistant(sessionId);
        get().addMessage(sessionId, {
          sessionId,
          type: 'system',
          content: line.trim(),
        });
        return;
      }
    }

    set((state) => ({
      pendingAssistant: {
        ...state.pendingAssistant,
        [sessionId]: (state.pendingAssistant[sessionId] ?? '') + cleaned,
      },
    }));
  },

  flushAssistant: (sessionId) => {
    const pending = get().pendingAssistant[sessionId];
    if (!pending?.trim()) return;

    get().addMessage(sessionId, {
      sessionId,
      type: 'assistant',
      content: pending.trim(),
    });

    set((state) => ({
      pendingAssistant: {
        ...state.pendingAssistant,
        [sessionId]: '',
      },
    }));
  },

  getMessages: (sessionId) => {
    return get().messages[sessionId] ?? [];
  },

  clearMessages: (sessionId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [],
      },
      pendingAssistant: {
        ...state.pendingAssistant,
        [sessionId]: '',
      },
    }));
  },
}));
