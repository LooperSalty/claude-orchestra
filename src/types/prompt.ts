export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  category: PromptCategory;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type PromptCategory = 'general' | 'coding' | 'debugging' | 'review' | 'planning' | 'custom';

export const PROMPT_CATEGORIES: Record<PromptCategory, { label: string; color: string }> = {
  general: { label: 'General', color: 'var(--color-accent-cyan)' },
  coding: { label: 'Coding', color: 'var(--color-accent-green)' },
  debugging: { label: 'Debugging', color: 'var(--color-accent-red)' },
  review: { label: 'Review', color: 'var(--color-accent-violet)' },
  planning: { label: 'Planning', color: 'var(--color-accent-amber)' },
  custom: { label: 'Custom', color: 'var(--color-text-secondary)' },
};
