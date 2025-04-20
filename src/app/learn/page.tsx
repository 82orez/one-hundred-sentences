"use client";
import { useEffect, useState } from "react";
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
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";

// ✅ Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const { data: session, status } = useSession();
  const { nextDay, setNextDay, initializeNextDay, updateNextDayInDB } = useLearningStore();
  const [progress, setProgress] = useState(0); // 완료된 문장 갯수: completedSentences 배열의 길이
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const router = useRouter();

  // ✅ 사용자가 학습 완료한 문장 정보 가져오기
  const {
    data: completedSentences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);

      console.log(
        "completedSentences@LearnPage: ",
        res.data,
        res.data.map((item: { sentenceNo: number }) => item.sentenceNo),
      );

      // return 값은 [1, 2, ...] 형태로 반환 -> Only 완료된 문장 번호 in 배열
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo);
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ DB 에서 nextDay 정보 초기화
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      initializeNextDay();
    }
  }, [initializeNextDay, session?.user?.id, status]);

  // ✅ 학습할 다음 Day(nextDay) 계산 (5문장 완료 기준)
  const getNextLearningDay = () => {
    if (!completedSentences || completedSentences.length === 0) return 1;

    // 완료된 문장을 학습일 단위로 그룹화
    const completedDays = new Set(completedSentences.map((no) => Math.ceil(no / 5)));

    // Set 을 배열로 변환하고, 빈 경우 기본값 설정
    const completedDaysArray = Array.from(completedDays) as number[];
    const lastCompletedDay = completedDaysArray.length > 0 ? Math.max(...completedDaysArray) : 0;

    // 모든 문장이 완료된 경우에만 다음 학습일(nextDay) 변경
    return completedDays.has(lastCompletedDay) && completedSentences.length >= lastCompletedDay * 5
      ? Math.min(lastCompletedDay + 1, 20)
      : lastCompletedDay || 1; // 빈 경우 최소 Day 1 보장
  };

  // ✅ useEffect 를 사용하여 completedSentences 가 변경될 때마다 nextDay 업데이트
  useEffect(() => {
    if (completedSentences && status === "authenticated") {
      const calculatedNextDay = getNextLearningDay();

      // 100문장 모두 완료했는지 확인
      const allCompleted = completedSentences.length >= 100;

      // DB에 nextDay 와 totalCompleted 업데이트
      updateNextDayInDB(calculatedNextDay, allCompleted);

      // 로컬 상태 업데이트
      setNextDay(calculatedNextDay);
    }
  }, [completedSentences, setNextDay, updateNextDayInDB, status]);

  // ✅ 완료된 문장 갯수 산출
  useEffect(() => {
    if (completedSentences) {
      setProgress(Math.min((completedSentences.length / 100) * 100, 100)); // ✅ 100% 초과 방지
    }
  }, [completedSentences]);

  // ✅ 원형 진행률 차트 데이터
  const progressData = {
    datasets: [
      {
        data: [progress, 100 - progress], // 진행률과 남은 부분
        backgroundColor: ["#4F46E5", "#E5E7EB"], // 파란색 & 회색
        borderWidth: 8, // 테두리 두께로 입체감 표현
        cutout: "70%", // 내부 원 크기 조정 (입체적인 도넛 모양)
      },
    ],
  };

  // ✅ ESC 키로 Quiz 모달 닫기 기능 추가
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

  if (isLoading) return <LoadingPageSkeleton />;
  if (isNavigating) return <LoadingPageSkeleton />;
  if (error) {
    console.log(error.message);
    return <p>Error loading Lists</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h1 className="text-3xl font-bold">하루 5문장, 20일이면 100문장!</h1>
      <p className="mt-2 text-lg text-gray-600">매일 5문장씩 학습하여 여행영어 100문장을 완성하세요.</p>

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
          className="mt-4 cursor-pointer rounded-lg border-white bg-blue-700 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
          onClick={() => {
            setIsNavigating(true);
            router.push(`/learn/${nextDay}`);
          }} // ✅ nextDay 로 이동
        >
          오늘 학습 시작하기
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">추가 학습</h2>
        <p className="text-gray-600">복습하거나 퀴즈를 풀어보세요.</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="cursor-pointer rounded-lg bg-green-700 px-4 py-2 text-white shadow transition hover:bg-green-600"
            onClick={() => router.push("/review")}>
            복습하기
          </button>
          <button
            className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-2 text-white shadow transition hover:bg-yellow-600"
            onClick={() => setQuizModalOpen(true)}>
            퀴즈 풀기
          </button>
        </div>

        <button
          className={"btn btn-primary mt-10"}
          onClick={() => {
            const url = "https://us04web.zoom.us/j/3080825122?pwd=edksBWiLSuQ2gFIP6bMMuO5FSppKTw.1";
            window.open(url, "_blank");
          }}>
          화상 수업 시작하기
        </button>
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
              className="relative mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
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
