import { create } from 'zustand';
import type { Skill, SkillCategory } from '@/types/skill';

interface SkillState {
  skills: Skill[];
  filterCategory: SkillCategory | 'all';
  searchQuery: string;
}

interface SkillActions {
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

  setSkills: (skills) => set({ skills }),

  toggleSkill: (id) =>
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
      ),
    })),

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
