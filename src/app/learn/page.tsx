"use client";
import { useEffect, useState, useRef } from "react";
import { useLearningStore } from "@/stores/useLearningStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const HomePage = () => {
  const { data: session, status } = useSession();
  const { currentDay } = useLearningStore();
  const [progress, setProgress] = useState(0);
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const router = useRouter();

  // ✅ 사용자가 완료한 문장 정보 가져오기
  const { data: completedSentences, isLoading } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo);
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 사용자가 완료한 가장 높은 학습일 계산
  const getNextLearningDay = () => {
    if (!completedSentences || completedSentences.length === 0) return 1; // 학습 시작 전이면 Day 1

    const highestCompletedSentence = Math.max(...completedSentences);
    const completedDays = Math.ceil(highestCompletedSentence / 5); // ✅ 5문장 단위로 학습일 계산
    return completedDays + 1 > 20 ? 20 : completedDays + 1; // ✅ 최대 20일까지만 진행
  };

  const nextDay = getNextLearningDay() || 1; // ✅ 최소 Day 1을 보장

  useEffect(() => {
    if (completedSentences) {
      setProgress(Math.min((completedSentences.length / 100) * 100, 100)); // ✅ 100% 초과 방지
    }
  }, [completedSentences]);

  // ✅ ESC 키로 모달 닫기 기능 추가
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuizModalOpen(false);
      }
    };
    if (isQuizModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isQuizModalOpen]);

  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h1 className="text-3xl font-bold">하루 5문장, 20일 완성!</h1>
      <p className="mt-2 text-lg text-gray-600">매일 5문장씩 학습하여 영어 100문장을 완성하세요.</p>

      <div className="mx-auto mt-6 w-full max-w-md rounded-lg bg-gray-100 p-4 shadow">
        <p className="text-lg font-semibold">진행률: {progress.toFixed(0)}%</p>
        <div className="mt-2 h-4 w-full rounded-full bg-gray-300">
          <div className="h-4 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">오늘의 학습</h2>
        <p className="text-2xl font-bold text-gray-600">Day - {nextDay}</p>
        <button
          className="mt-4 rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
          onClick={() => router.push(`/learn/${nextDay}`)} // ✅ nextDay 로 이동
        >
          {nextDay}일차 학습 시작 🚀
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">추가 학습</h2>
        <p className="text-gray-600">복습하거나 퀴즈를 풀어보세요.</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white shadow transition hover:bg-green-600"
            onClick={() => router.push("/review")}>
            복습하기
          </button>
          <button
            className="rounded-lg bg-yellow-500 px-4 py-2 text-white shadow transition hover:bg-yellow-600"
            onClick={() => setQuizModalOpen(true)}>
            퀴즈 풀기
          </button>
        </div>
      </div>

      {/* ✅ 퀴즈 선택 모달 */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuizModalOpen(false)}>
            <motion.div
              className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-gray-800" onClick={() => setQuizModalOpen(false)}>
                ×
              </button>
              <h2 className="mb-4 text-center text-xl font-semibold">퀴즈 유형 선택</h2>
              <div className="flex flex-col gap-4">
                <button
                  className="w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
                  onClick={() => router.push("/quiz/speaking")}>
                  영어로 말하기
                </button>
                <button
                  className="w-full rounded-lg bg-green-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600"
                  onClick={() => router.push("/quiz/dictation")}>
                  받아쓰기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={clsx("mt-10 flex justify-center hover:underline", {})}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
};

export default HomePage;
