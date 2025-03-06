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
import { HiOutlineSparkles } from "react-icons/hi2";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// * Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

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

  // ✅ 학습할 다음 Day 계산 (5문장 완료 기준)
  const getNextLearningDay = () => {
    if (!completedSentences || completedSentences.length === 0) return 1;

    // ✅ 완료된 문장을 학습일 단위로 그룹화
    const completedDays = new Set(completedSentences.map((no) => Math.ceil(no / 5)));

    // ✅ 현재까지 완료된 마지막 학습일 계산
    const lastCompletedDay = Math.max(...Array.from(completedDays));

    // ✅ 모든 문장이 완료된 경우에만 다음 학습일로 이동
    return completedDays.has(lastCompletedDay) && completedSentences.length >= lastCompletedDay * 5
      ? Math.min(lastCompletedDay + 1, 20)
      : lastCompletedDay;
  };

  const nextDay = getNextLearningDay(); // ✅ 개선된 로직 적용

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

  // ✅ 원형 진행률 차트 데이터
  const progressData = {
    datasets: [
      {
        data: [progress, 100 - progress], // 진행률과 남은 부분
        backgroundColor: ["#4F46E5", "#E5E7EB"], // ✅ 파란색 & 회색
        borderWidth: 8, // ✅ 테두리 두께로 입체감 표현
        cutout: "70%", // ✅ 내부 원 크기 조정 (입체적인 도넛 모양)
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h1 className="text-3xl font-bold">하루 5문장, 20일이면 100문장!</h1>
      <p className="mt-2 text-lg text-gray-600">매일 5문장씩 학습하여 여행영어 100문장을 완성하세요.</p>

      {/*<div className="mx-auto mt-6 w-full max-w-md rounded-lg bg-gray-100 p-4 shadow">*/}
      {/*  <p className="text-lg font-semibold">현재까지 학습 진행률: {progress.toFixed(0)}%</p>*/}
      {/*  <div className="mt-2 h-4 w-full rounded-full bg-gray-300">*/}
      {/*    <div className="h-4 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* ✅ 원형 진행률 차트 */}
      <div className="relative mx-auto mt-6 mb-14 h-48 w-48">
        <Doughnut data={progressData} />
        {/* 진행률 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">{progress.toFixed(0)}%</div>
        <p>학습 진행율</p>
      </div>

      <div className="mt-8">
        {/*<h2 className="text-xl font-semibold">오늘의 학습</h2>*/}
        <p className="text-2xl font-bold text-gray-600">" 오늘은 학습 {nextDay} 일차 "</p>
        <button
          className="mt-4 cursor-pointer rounded-lg border-white bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
          onClick={() => router.push(`/learn/${nextDay}`)} // ✅ nextDay 로 이동
        >
          오늘 학습 시작하기
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">추가 학습</h2>
        <p className="text-gray-600">복습하거나 퀴즈를 풀어보세요.</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="cursor-pointer rounded-lg bg-green-500 px-4 py-2 text-white shadow transition hover:bg-green-600"
            onClick={() => router.push("/review")}>
            복습하기
          </button>
          <button
            className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-2 text-white shadow transition hover:bg-yellow-600"
            onClick={() => setQuizModalOpen(true)}>
            퀴즈 풀기
          </button>
        </div>
      </div>

      {/* ✅ 퀴즈 선택 모달 */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-200"
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
                  className="relative w-full rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:brightness-110"
                  onClick={() => router.push("/quiz/speaking")}>
                  <div className="flex animate-pulse items-center justify-center gap-2">
                    <HiOutlineSparkles className="animate-spin-slow h-5 w-5 text-white" />
                    <span className="drop-shadow-md">영어로 말하기 with AI</span>
                    <HiOutlineSparkles className="animate-spin-slow h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -top-2 -left-3 rounded-full bg-red-600 px-2 py-1 text-xs text-white shadow-md">Premium ⭐️</span>
                </button>
                <button
                  className="w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600"
                  onClick={() => router.push("/quiz/dictation")}>
                  Dictation - 받아쓰기
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
