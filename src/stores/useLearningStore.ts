import { create } from "zustand";

interface LearningState {
  currentDay: number;
  completedSentences: number[];
  markSentenceComplete: (sentenceId: number) => void;
  nextDay: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  currentDay: 1,
  completedSentences: [],
  markSentenceComplete: (sentenceId) =>
    set((state) => ({
      completedSentences: [...state.completedSentences, sentenceId],
    })),
  nextDay: () =>
    set((state) => ({
      currentDay: state.currentDay + 1,
    })),
}));
