// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
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

// ✅ Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedSentences: 0,
    totalSentences: 100,
    completedDays: 0,
    totalDays: 20,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        const { data } = await axios.get("/api/review/completed");
        setCompletedDays(data.completedDays || []);

        setStats({
          completedSentences: data.completedDays?.length * 5 || 0,
          totalSentences: 100,
          completedDays: data.completedDays?.length || 0,
          totalDays: 20,
        });

        setLoading(false);
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [status, router]);

  const COLORS = ["#4ade80", "#e4e4e7"];

  const { currentDay, nextDay, setNextDay } = useLearningStore();
  const [progress, setProgress] = useState(0); // 완료된 문장 갯수: completedSentences 배열의 길이
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const supabase = createClient();

  const getSentenceCount = useQuery({
    queryKey: ["SentenceCount"],
    queryFn: async () => {
      const { count, error } = await supabase.from("Sentence").select("*", { count: "exact", head: true });

      if (error) {
        console.error("Sentence 카운트 조회 실패:", error);
        throw new Error("문장 수 조회에 실패했습니다.");
      }

      console.log("Sentence 갯수: ", { count });
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isCompletedSentencesError) {
    console.log(isCompletedSentencesError.message);
    return <p>Error loading Lists</p>;
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
            전체 {getSentenceCount.data?.count} 문장 중 {progress} 문장 학습 완료!
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

      {/* 최근 학습 현황 및 다음 학습일 추천 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">학습 현황</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={`flex h-12 items-center justify-center rounded-md ${
                    completedDays.includes(day) ? "bg-green-500 text-white" : "bg-gray-100"
                  }`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-green-500"></div>
                <span className="text-sm">완료</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-gray-100"></div>
                <span className="text-sm">미완료</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">다음 학습일 추천</h2>
          {completedDays.length === 20 ? (
            <div className="py-8 text-center">
              <p className="text-lg font-medium">모든 학습일을 완료했습니다!</p>
              <p className="mt-2 text-gray-500">축하합니다. 복습을 통해 실력을 다져보세요.</p>
            </div>
          ) : (
            <div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="font-medium">추천 학습: {nextDay}일차</p>
                <p className="mt-2 text-sm text-gray-600">체계적인 학습을 위해 {nextDay}일차 학습을 진행해보세요.</p>
                <Link href={`/learn/${nextDay}`} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                  지금 학습하기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium">최근 복습</h3>
                {completedDays.length > 0 ? (
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
    </div>
  );
}
