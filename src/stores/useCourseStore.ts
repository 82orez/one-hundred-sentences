// /stores/useCourseStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CourseState {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;

  selectedCourseContents: string;
  setSelectedCourseContents: (contents: string) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      selectedCourseId: "",
      setSelectedCourseId: (id) => set({ selectedCourseId: id }),

      selectedCourseContents: "",
      setSelectedCourseContents: (contents) => set({ selectedCourseContents: contents }),
    }),
    {
      name: "course-storage", // localStorage에 저장될 키 이름
    },
  ),
);
