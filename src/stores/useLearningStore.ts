import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

type LearningStore = {
  currentDay: number;
  nextDay: number;
  isLoading: boolean;
  completedSentencesStore: number[]; // 완료된 문장 번호 배열 추가
  setCompletedSentencesStore: (sentences: number[]) => void;
  setCurrentDay: (day: number) => void;
  setNextDay: (day: number) => void;
  initializeNextDay: () => Promise<void>;
  updateNextDayInDB: (day: number, totalCompleted?: boolean) => Promise<void>;
  markSentenceComplete: (sentenceNo: number) => Promise<void>; // 새로운 함수 추가
};

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      currentDay: 1,
      nextDay: 1,
      isLoading: false,
      completedSentencesStore: [], // 완료된 문장 번호 배열 초기화
      // 새 함수 추가
      setCompletedSentencesStore: (sentences: number[]) => set({ completedSentencesStore: sentences }),

      setCurrentDay: (day) => set({ currentDay: day }),

      setNextDay: (day) => set({ nextDay: day }),

      // ✅ DB 에서 nextDay 정보 초기화 - nextDay 정보를 가져오거나 없으면 1일차 생성
      initializeNextDay: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get("/api/nextday");
          set({ nextDay: response.data.userNextDay });
        } catch (error) {
          console.error("nextDay 초기화 중 오류:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ DB 의 nextDay 정보 업데이트
      updateNextDayInDB: async (day, totalCompleted) => {
        set({ isLoading: true });
        try {
          // DB 업데이트
          await axios.post("/api/nextday", {
            nextDay: day,
            totalCompleted,
          });

          // 로컬 상태 업데이트
          set({ nextDay: day });
        } catch (error) {
          console.error("nextDay DB 업데이트 중 오류:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ 문장 완료 처리 함수 추가
      markSentenceComplete: async (sentenceNo: number) => {
        set({ isLoading: true });
        try {
          // API 를 통해 완료된 문장 저장
          await axios.post("/api/progress", { sentenceNo });

          // 로컬 상태 업데이트
          const currentCompletedSentences = get().completedSentencesStore;
          if (!currentCompletedSentences.includes(sentenceNo)) {
            set({
              completedSentencesStore: [...currentCompletedSentences, sentenceNo],
            });
          }
        } catch (error) {
          console.error("문장 완료 처리 중 오류:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "learning-store",
    },
  ),
);
