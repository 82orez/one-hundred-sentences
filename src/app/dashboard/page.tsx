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
import { HiOutlineSparkles } from "react-icons/hi2";
import FlipCounter from "@/components/FlipCounterAnimation";

// ✅ Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { completedSentencesStore, setCompletedSentencesStore, nextDay, setNextDay, initializeNextDay, updateNextDayInDB } = useLearningStore();
  const [progress, setProgress] = useState(0); // 완료된 문장 갯수: completedSentences 배열의 길이
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // 복습하기와 연관
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/sign-in");
      return;
    } else if (!session?.user?.realName || !session?.user?.phone) {
      // alert("회원 가입 후에는 반드시 회원 정보를 입력해 주세요.");
      router.push("/users/edit");
      return;
    }
  }, [status, router]);

  // ✅ Sentence 모델에 등록된 문장 갯수 가져오기
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
        "completedSentences@dashboard: ",
        res.data,
        res.data.map((item: { sentenceNo: number }) => item.sentenceNo),
      );

      // return 값은 [1, 2, ...] 형태로 반환 -> Only 완료된 문장 번호 in 배열
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo);
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // 쿼리 결과가 변경될 때마다 store 에 저장
  useEffect(() => {
    if (completedSentences && !isCompletedSentencesLoading) {
      setCompletedSentencesStore(completedSentences);
    }
    console.log("completedSentencesStore: ", completedSentencesStore);
  }, [completedSentences, isCompletedSentencesLoading, setCompletedSentencesStore]);

  // ✅ 페이지가 로드 되면 DB 에서 nextDay 정보 초기화
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      initializeNextDay();
    }
  }, [initializeNextDay, session?.user?.id, status]);

  // *✅ 다음 학습일(nextDay) 계산 부분을 src/app/learn/[day]/page.tsx 페이지로 이동

  // ✅ 학습 완료된 문장 갯수 산출
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

  // ✅ 원어민 음성 듣기 횟수 조회
  const { data: nativeAudioData } = useQuery({
    queryKey: ["nativeAudioCount", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/native-audio/count?userId=${session?.user?.id}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 영상 시청 시간 합계 가져오기
  const { data: totalVideoDuration, isLoading: isVideoDurationLoading } = useQuery({
    queryKey: ["videoDuration", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      const res = await axios.get(`/api/youtube-view/total?userId=${session.user.id}`);
      return res.data.totalDuration || 0;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 시간을 포맷팅하는 함수: 초 단위를 시간:분:초 형식으로 변환
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours > 0 ? `${hours}시간 ` : ""}${minutes}분 ${remainingSeconds}초`;
  };

  // ✅ 숙제 제출 횟수 조회
  const { data: totalRecordingAttempts, isLoading: isRecordingAttemptsLoading } = useQuery({
    queryKey: ["totalRecordingAttempts", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/recorder/total?userId=${session?.user?.id}`);
      return res.data.totalAttempts;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 퀴즈 풀이 통계 조회
  const { data: quizStats, isLoading: isQuizStatsLoading } = useQuery({
    queryKey: ["quizStats", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/attempts/quiz-stats?userId=${session?.user?.id}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // 포인트 계산을 위한 useState 추가
  const [totalPoints, setTotalPoints] = useState(0);

  // 포인트 계산 로직
  useEffect(() => {
    if (isQuizStatsLoading || isVideoDurationLoading) return;

    // 각 활동별 포인트 가중치 설정
    const VIDEO_POINT_PER_SECOND = 0.5; // 영상 시청 1초당 0.5 포인트
    const AUDIO_POINT_PER_ATTEMPT = 1; // 원어민 음성 듣기 1회당 1 포인트
    const RECORDING_POINT_PER_ATTEMPT = 20; // 숙제 제출 1회당 10 포인트
    const QUIZ_ATTEMPT_POINT = 3; // 퀴즈 풀이 1회당 3 포인트
    const QUIZ_CORRECT_POINT = 3; // 퀴즈 정답 1회당 3 포인트 추가

    // 영상 시청 포인트 (초 단위 시청 시간 * 포인트)
    const videoPoints = totalVideoDuration * VIDEO_POINT_PER_SECOND;

    // 원어민 음성 듣기 포인트
    const audioPoints = (nativeAudioData?.totalAttempts || 0) * AUDIO_POINT_PER_ATTEMPT;

    // 숙제 제출 포인트
    const recordingPoints = (totalRecordingAttempts || 0) * RECORDING_POINT_PER_ATTEMPT;

    // 퀴즈 풀이 및 정답 포인트
    const quizAttemptPoints = (quizStats?.totalAttempts || 0) * QUIZ_ATTEMPT_POINT;
    const quizCorrectPoints = (quizStats?.totalCorrect || 0) * QUIZ_CORRECT_POINT;

    // 총 포인트 계산
    const total = Math.round(videoPoints + audioPoints + recordingPoints + quizAttemptPoints + quizCorrectPoints);

    // 상태 업데이트
    setTotalPoints(total);
  }, [
    totalVideoDuration,
    nativeAudioData?.totalAttempts,
    totalRecordingAttempts,
    quizStats?.totalAttempts,
    quizStats?.totalCorrect,
    isQuizStatsLoading,
    isVideoDurationLoading,
  ]);

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
      <h1 className="mb-4 text-center text-2xl font-semibold md:mb-8 md:text-4xl">나의 학습 현황</h1>

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
            <h2 className="text-xl font-semibold">나의 학업 성취 Point</h2>
          </div>
          {/*<p className="text-3xl font-bold">*/}
          {/*  {progress === 100 ? 20 : nextDay - 1}/{getSentenceCount.data?.count / 5 || 100}*/}
          {/*</p>*/}
          {/*<p className="text-gray-500">학습 완료 현황</p>*/}
          {/*<div className="mt-2">*/}
          {/*  <p className="text-sm">*/}
          {/*    전체 진행률:{" "}*/}
          {/*    <span className="font-semibold">*/}
          {/*      {progress === 100 ? 100 : Math.round(((nextDay - 1) / (getSentenceCount.data?.count / 5)) * 100)}%*/}
          {/*    </span>*/}
          {/*  </p>*/}
          {/*  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">*/}
          {/*    <div*/}
          {/*      className="h-2 rounded-full bg-purple-500"*/}
          {/*      style={{ width: `${progress === 100 ? 100 : ((nextDay - 1) / (getSentenceCount.data?.count / 5)) * 100}%` }}></div>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="flex items-center justify-between">
            <div>강의 영상 시청</div>
            <div>{!isVideoDurationLoading && <span className="font-semibold text-blue-600">총 {formatDuration(totalVideoDuration)}</span>}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>원어민 음성 듣기</div>
            <div className="font-semibold text-blue-600">{nativeAudioData?.totalAttempts || 0}회</div>
          </div>
          <div className="flex items-center justify-between">
            <div>숙제 제출</div>
            <div className="font-semibold text-blue-600">{totalRecordingAttempts || 0}회</div>
          </div>

          <div className="flex items-center justify-between">
            <div>스피킹/퀴즈 (정답)횟수</div>
            <div className="font-semibold text-blue-600">
              ({quizStats?.totalCorrect || 0}) {quizStats?.totalAttempts || 0}회
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-3 border-t border-gray-200"></div>

          {/* 총 획득 포인트 표시 */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">총 획득 포인트</div>
            <div className="flex text-xl font-bold text-indigo-600">
              <FlipCounter value={totalPoints} className={""} />
              <span className="ml-1">P</span>
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
                  const isInProgress = day === nextDay && !isCompleted; // ✅ 현재 진행 중인 학습일(오늘 학습일)

                  return (
                    <button
                      key={day}
                      className={clsx(
                        "min-w-[60px] rounded-lg p-3 font-semibold transition md:min-w-[100px]",
                        isCompleted
                          ? "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500"
                          : isInProgress
                            ? "cursor-pointer bg-amber-500 text-white hover:bg-amber-400" // 진행 중인 학습일 스타일
                            : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-50",
                      )}
                      disabled={!isCompleted && !isInProgress}
                      onClick={() => {
                        if ((isCompleted || isInProgress) && selectedDay !== day) {
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

            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-indigo-600"></div>
                <span className="text-sm">완료</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-amber-500"></div>
                <span className="text-sm">진행중</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-gray-300"></div>
                <span className="text-sm">대기중</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <button
              className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-2 text-white shadow transition hover:bg-yellow-600"
              onClick={() => setQuizModalOpen(true)}>
              퀴즈 풀기
            </button>
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

      {/* ✅ 복습 모달 (framer-motion 적용) */}
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
                className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-2xl font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800"
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
                {selectedDay}일차 학습 시작 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 퀴즈 모달 */}
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
    </div>
  );
}
