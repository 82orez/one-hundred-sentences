import { create } from "zustand";

interface LearningState {
  currentDay: number;
  nextDay: number; // 추가된 nextDay 변수
  completedSentences: number[];
  markSentenceComplete: (sentenceId: number) => void;
  incrementDay: () => void; // 함수명 변경
  setNextDay: (day: number) => void; // nextDay 를 설정하는 함수 추가
}

export const useLearningStore = create<LearningState>((set) => ({
  currentDay: 1,
  nextDay: 1, // 초기값 설정
  completedSentences: [],
  markSentenceComplete: (sentenceId) =>
    set((state) => ({
      completedSentences: [...state.completedSentences, sentenceId],
    })),
  incrementDay: () =>
    set((state) => ({
      currentDay: state.currentDay + 1,
    })),
  setNextDay: (day) =>
    set(() => ({
      nextDay: day,
    })),
}));
