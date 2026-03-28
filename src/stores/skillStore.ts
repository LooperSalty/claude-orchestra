import { create } from 'zustand';
import type { Skill, SkillCategory } from '@/types/skill';
import {
  dbListSkills,
  dbUpdateSkill,
} from '@/lib/database';

interface SkillState {
  skills: Skill[];
  filterCategory: SkillCategory | 'all';
  searchQuery: string;
  isLoading: boolean;
}

interface SkillActions {
  loadSkills: () => Promise<void>;
  setSkills: (skills: Skill[]) => void;
  toggleSkill: (id: string) => void;
  setFilterCategory: (category: SkillCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  filteredSkills: () => Skill[];
}

export const useSkillStore = create<SkillState & SkillActions>((set, get) => ({
  skills: [],
  filterCategory: 'all',
  searchQuery: '',
  isLoading: false,

  loadSkills: async () => {
    set({ isLoading: true });
    try {
      const skills = await dbListSkills();
      set({ skills });
    } catch (err) {
      console.error('[skillStore] Failed to load skills:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSkills: (skills) => set({ skills }),

  toggleSkill: (id) => {
    const skill = get().skills.find((s) => s.id === id);
    const newEnabled = skill ? !skill.isEnabled : true;

    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, isEnabled: newEnabled } : s
      ),
    }));

    dbUpdateSkill(id, { isEnabled: newEnabled }).catch((err) =>
      console.error('[skillStore] Failed to persist skill toggle:', err),
    );
  },

  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  filteredSkills: () => {
    const { skills, filterCategory, searchQuery } = get();
    return skills.filter((s) => {
      const matchesCategory =
        filterCategory === 'all' || s.category === filterCategory;
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  },
}));
