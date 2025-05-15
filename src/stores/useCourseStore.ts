// /stores/useCourseStore.ts
import { create } from "zustand";

interface CourseState {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;

  selectedCourseContents: string;
  setSelectedCourseContents: (contents: string) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  selectedCourseId: "",
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),

  selectedCourseContents: "",
  setSelectedCourseContents: (contents) => set({ selectedCourseContents: contents }),
}));
