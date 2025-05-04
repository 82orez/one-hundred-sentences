// src/stores/useTeacherConflictStore.ts
import { create } from "zustand";

interface ConflictingCourse {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TeacherConflictState {
  conflicts: Record<string, ConflictingCourse[]>;
  setConflicts: (conflicts: Record<string, ConflictingCourse[]>) => void;
  hasConflict: (teacherId: string) => boolean;
  getConflictsByTeacherId: (teacherId: string) => ConflictingCourse[];
  clearConflicts: () => void;
}

export const useTeacherConflictStore = create<TeacherConflictState>((set, get) => ({
  conflicts: {},

  setConflicts: (conflicts) => set({ conflicts }),

  hasConflict: (teacherId) => {
    const { conflicts } = get();
    return !!conflicts[teacherId] && conflicts[teacherId].length > 0;
  },

  getConflictsByTeacherId: (teacherId) => {
    const { conflicts } = get();
    return conflicts[teacherId] || [];
  },

  clearConflicts: () => set({ conflicts: {} }),
}));
