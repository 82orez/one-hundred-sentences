// app/dashboard/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, LucideBook, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useLearningStore } from "@/stores/useLearningStore";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

// ✅ Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/sign-in");
      return;
    }
  }, [status, router]);

  const { nextDay, setNextDay } = useLearningStore();
  const [progress, setProgress] = useState(0); // 완료된 문장 갯수: completedSentences 배열의 길이
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // 복습하기와 연관
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const supabase = createClient();

  const getSentenceCount = useQuery({
    queryKey: ["SentenceCount"],
    queryFn: async () => {
      const { count, error } = await supabase.from("Sentence").select("*", { count: "exact", head: true });

      if (error) {
        console.error("Sentence 카운트 조회 실패:", error);
        throw new Error("문장 수 조회에 실패했습니다.");
      }

      console.log("전체 Sentence 갯수: ", count);
      return { count };
    },
  });

  // ✅ 사용자가 완료한 문장 정보 가져오기
  const {
    data: completedSentences,
    isLoading: isCompletedSentencesLoading,
    error: isCompletedSentencesError,
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

  // ✅ useEffect 를 사용하여 completedSentences 가 변경될 때마다(문장 하나를 학습 완료했을 때) nextDay 업데이트
  useEffect(() => {
    if (completedSentences) {
      const calculatedNextDay = getNextLearningDay();
      setNextDay(calculatedNextDay); // Zustand 스토어의 nextDay 업데이트
    }
  }, [completedSentences, setNextDay]);

  // ✅ 완료된 문장 갯수 산출
  useEffect(() => {
    if (completedSentences) {
      setProgress(Math.min((completedSentences.length / 100) * 100, 100)); // 100% 초과 방지
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

  // ✅ 완료된 학습일 가져오기
  const { data: completedDays, isLoading } = useQuery({
    queryKey: ["completedDays"],
    queryFn: async () => {
      const res = await axios.get("/api/review");
      return res.data.completedDays;
    },
  });

  // ✅ 선택한 학습일의 문장 목록 가져오기
  const { data: sentences, isFetching } = useQuery({
    queryKey: ["reviewSentences", selectedDay],
    queryFn: async () => {
      if (!selectedDay) return [];
      const res = await axios.get(`/api/review/sentences?day=${selectedDay}`);
      return res.data;
    },
    enabled: !!selectedDay,
  });

  if (getSentenceCount.isLoading) return <LoadingPageSkeleton />;
  if (getSentenceCount.isError) {
    console.log(getSentenceCount.error.message);
    return <p>Error loading Sentences count</p>;
  }

  if (isCompletedSentencesLoading) return <LoadingPageSkeleton />;
  if (isCompletedSentencesError) {
    console.log(isCompletedSentencesError.message);
    return <p>Error loading Completed Sentences Lists</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-center text-3xl font-semibold">나의 학습 현황</h1>

      {/* 학습 진행 상황 개요 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-0 flex items-center">
            <LucideBook className="mr-2 h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">문장 학습 진행률</h2>
          </div>
          {/* ✅ 원형 진행률 차트 */}
          <div className="relative mx-auto mt-0 mb-0 h-52 w-52">
            <Doughnut data={progressData} />
            {/* 진행률 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">{progress.toFixed(0)}%</div>
          </div>
          <p className="mt-2 text-center text-gray-700">
            전체 {getSentenceCount.data?.count} 문장 중 {progress.toFixed(0)} 문장 학습 완료!
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">학습일 기준 완료 현황</h2>
          </div>
          <p className="text-3xl font-bold">
            {progress === 100 ? 20 : nextDay - 1}/{getSentenceCount.data?.count / 5 || 100}
          </p>
          <p className="text-gray-500">학습 완료 현황</p>
          <div className="mt-2">
            <p className="text-sm">
              전체 진행률:{" "}
              <span className="font-semibold">
                {progress === 100 ? 100 : Math.round(((nextDay - 1) / (getSentenceCount.data?.count / 5)) * 100)}%
              </span>
            </p>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-purple-500"
                style={{ width: `${progress === 100 ? 100 : ((nextDay - 1) / (getSentenceCount.data?.count / 5)) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <Award className="mr-2 h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">학습 성취도</h2>
          </div>
          <div className="py-4 text-center">
            {progress < 5 ? (
              <>
                <p className="text-xl font-medium">초보 학습자</p>
                <p className="mt-2 text-gray-500">5일 이상 완료하면 중급 학습자로 승급!</p>
              </>
            ) : progress < 15 ? (
              <>
                <p className="text-xl font-medium">중급 학습자</p>
                <p className="mt-2 text-gray-500">15일 이상 완료하면 고급 학습자로 승급!</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium">고급 학습자</p>
                <p className="mt-2 text-gray-500">축하합니다! 최고 레벨에 도달했습니다.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 학습 현황 및 복습 + 다음 학습일 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 학습 현황 및 복습 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">학습 현황 및 복습하기</h2>
          <div className="space-y-4">
            {/* ✅ 학습일 선택 목록 */}
            {isLoading ? (
              <LoadingPageSkeleton />
            ) : (
              <div className="mt-6 grid grid-cols-4 gap-2 md:grid-cols-5 md:gap-5">
                {[...Array(20)].map((_, index) => {
                  const day = index + 1;
                  const isCompleted = completedDays?.includes(day); // ✅ 5문장을 완료한 학습일만 활성화

                  return (
                    <button
                      key={day}
                      className={clsx(
                        "min-w-[60px] rounded-lg p-3 font-bold transition md:min-w-[100px]",
                        isCompleted
                          ? "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500"
                          : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-50",
                      )}
                      disabled={!isCompleted}
                      onClick={() => {
                        if (isCompleted && selectedDay !== day) {
                          // selectedDay 에 특정 숫자가 설정되면 복습하기 모달창이 열림.
                          setSelectedDay(day);
                        }
                      }}>
                      {day}
                      <span className="hidden md:inline">일차</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-indigo-600"></div>
                <span className="text-sm">완료</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-gray-100"></div>
                <span className="text-sm">미완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 학습일 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">다음 학습일</h2>
          {completedDays?.length === 20 ? (
            <div className="py-8 text-center">
              <p className="text-lg font-medium">모든 학습일을 완료했습니다!</p>
              <p className="mt-2 text-gray-500">축하합니다. 복습을 통해 실력을 다져보세요.</p>
            </div>
          ) : (
            <div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="font-medium">학습 {nextDay} 일차</p>
                <p className="mt-2 text-sm text-gray-600">체계적인 학습을 위해 {nextDay}일차 학습을 진행해보세요.</p>
                <Link href={`/learn/${nextDay}`} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                  지금 학습하기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium">최근 복습</h3>
                {completedDays?.length > 0 ? (
                  <div className="space-y-2">
                    {completedDays
                      .slice(-3)
                      .reverse()
                      .map((day) => (
                        <Link key={day} href={`/review/${day}`} className="block rounded bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                          {day}일차 복습하기
                        </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">아직 완료한 학습일이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 모달 창 (framer-motion 적용) */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)} // 모달 외부 클릭 시 닫기
          >
            <motion.div
              className="relative w-full max-w-lg rounded-lg bg-white px-4 py-6 shadow-lg md:px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않도록 방지
            >
              {/* 닫기 버튼 */}
              <button
                ref={closeButtonRef}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedDay(null)}>
                ×
              </button>

              <h2 className="mb-4 text-2xl font-semibold">Day {selectedDay} 학습 내용</h2>

              {isFetching ? (
                <LoadingPageSkeleton />
              ) : (
                <ul className="space-y-4">
                  {sentences?.map((sentence: { no: number; en: string; ko: string }) => (
                    <li key={sentence.no} className="rounded-md border p-2">
                      <p className="text-lg font-semibold">{sentence.en}</p>
                      <p className="text-gray-600">{sentence.ko}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* 복습 시작 버튼 */}
              <button
                className="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
                onClick={() => router.push(`/learn/${selectedDay}`)}>
                {selectedDay}일차 복습 시작 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
