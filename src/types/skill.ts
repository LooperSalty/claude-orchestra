export interface Skill {
  id: string;
  name: string;
  description?: string;
  path: string;
  version?: string;
  category: SkillCategory;
  icon?: string;
  isBuiltin: boolean;
  isEnabled: boolean;
  config: Record<string, unknown>;
  readmeContent?: string;
  installedAt: string;
}

export type SkillCategory =
  | 'document'
  | 'code'
  | 'data'
  | 'design'
  | 'ai'
  | 'integration'
  | 'custom';

export const SKILL_CATEGORY_COLORS: Record<SkillCategory, string> = {
  document: 'var(--accent-cyan)',
  code: 'var(--accent-primary)',
  data: 'var(--accent-success)',
  design: 'var(--accent-purple)',
  ai: 'var(--accent-orange)',
  integration: 'var(--accent-warning)',
  custom: 'var(--text-secondary)',
};
