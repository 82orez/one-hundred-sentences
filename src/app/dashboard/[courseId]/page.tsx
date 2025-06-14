// app/dashboard/page.tsx
"use client";

import { use, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, LucideBook, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQuery } from "@tanstack/react-query";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineSparkles } from "react-icons/hi2";
import FlipCounter from "@/components/FlipCounterAnimation";
import ClassMembersModal from "@/components/ClassMembersModal";
import CoursePointsRankingModal from "@/components/CoursePointsRankingModal";
import ClassVoiceModal from "@/components/ClassVoiceModal";
import { FiRefreshCw } from "react-icons/fi";

// ✅ Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  params: Promise<{ courseId: string }>;
};

export default function Dashboard({ params }: Props) {
  // const { courseId } = use(params);
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0); // 완료된 문장 갯수: completedSentences 배열의 길이
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const [isClassMembersModalOpen, setClassMembersModalOpen] = useState(false);
  const [isCoursePointsRankingModalOpen, setIsCoursePointsRankingModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // 복습하기와 연관
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ 로그인한 사용자의 Selected 정보 가져오기
  const { data: selectedData } = useQuery({
    queryKey: ["selected", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/selected?userId=${session?.user?.id}`);
      return response.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 필요한 변수 추출하기
  const selectedCourseId = selectedData?.selectedCourseId || "";
  const selectedCourseContents = selectedData?.selectedCourseContents || "";
  const selectedCourseTitle = selectedData?.selectedCourseTitle || "";

  const router = useRouter();
  // console.log("courseId: ", courseId);

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
    queryKey: ["SentenceCount", selectedCourseContents], // selectedCourseContents가 query에 반영되도록
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sentence/count", {
          params: { contents: selectedCourseContents },
        });

        console.log("전체 Sentence 갯수: ", response.data.count);
        return { count: response.data.count };
      } catch (error) {
        console.error("Sentence 카운트 조회 실패:", error);
        throw new Error("문장 수 조회에 실패했습니다.");
      }
    },
    enabled: !!selectedCourseContents, // selectedCourseContents가 null이 아닐 때만 실행
  });

  // ✅ 사용자가 완료한 문장 정보 가져오기
  const {
    data: completedSentences,
    isLoading: isCompletedSentencesLoading,
    error: isCompletedSentencesError,
  } = useQuery({
    queryKey: ["completedSentences", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}&courseId=${selectedCourseId}`);

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

  // ✅ 페이지가 로드 되면 DB 의 nextDay 정보 초기화
  const { data: nextDay } = useQuery({
    queryKey: ["nextDay", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const response = await axios.get(`/api/nextday?courseId=${selectedCourseId}`);
      console.log("nextDay: ", response.data.userNextDay);
      return response.data.userNextDay;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // * ✅ 다음 학습일(nextDay) 계산 부분을 src/app/learn/[day]/page.tsx 페이지로 이동

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
  // ? queryKey 추가 여부 selectedDay, selectedCourseContents, selectedCourseId
  const { data: completedDays, isLoading } = useQuery({
    queryKey: ["completedDays", selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/review?courseId=${selectedCourseId}`);
      console.log("completedDays: ", res.data.completedDays);
      return res.data.completedDays;
    },
  });

  // ✅ 선택한 학습일의 문장 목록 가져오기
  // ? queryKey 추가 여부 selectedDay, selectedCourseContents, selectedCourseId
  const { data: sentences, isFetching } = useQuery({
    queryKey: ["reviewSentences", selectedDay],
    queryFn: async () => {
      if (!selectedDay) return [];
      const res = await axios.get(`/api/review/sentences?day=${selectedDay}&selectedCourseContents=${selectedCourseContents}`);
      return res.data;
    },
    enabled: !!selectedDay,
  });

  // ✅ 영상 시청 시간 합계 가져오기
  const { data: totalVideoDuration, isLoading: isVideoDurationLoading } = useQuery({
    queryKey: ["videoDuration", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      const res = await axios.get(`/api/youtube-view/total?userId=${session.user.id}&courseId=${selectedCourseId}`);
      return res.data.totalDuration || 0;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // 시간을 포맷팅하는 함수: 초 단위를 시간:분:초 형식으로 변환
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours > 0 ? `${hours}시간 ` : ""}${minutes}분 ${remainingSeconds}초`;
  };

  // ✅ 원어민 음성 듣기 횟수 조회
  const { data: nativeAudioData } = useQuery({
    queryKey: ["nativeAudioCount", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/native-audio/count?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 숙제 제출 횟수 조회
  const { data: totalRecordingAttempts, isLoading: isRecordingAttemptsLoading } = useQuery({
    queryKey: ["totalRecordingAttempts", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/recorder/total?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data.totalAttempts;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 퀴즈 풀이 통계 조회
  const { data: quizStats, isLoading: isQuizStatsLoading } = useQuery({
    queryKey: ["quizStats", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/attempts/quiz-stats?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // 사용자의 공개 음성 파일 수 조회 useQuery 추가
  const { data: myVoiceOpenData } = useQuery({
    queryKey: ["myVoiceOpenCount", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/voice/my-open-count?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // 공개 음성 파일 수를 상태로 관리
  const [myVoiceOpenCount, setMyVoiceOpenCount] = useState(0);

  // 공개 음성 파일 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (myVoiceOpenData) {
      setMyVoiceOpenCount(myVoiceOpenData.count || 0);
    }
  }, [myVoiceOpenData]);

  // ✅ 사용자가 다른 수강생의 음성 파일에 좋아요 클릭한 횟수 조회를 위한 useQuery 추가
  const { data: userLikesData } = useQuery({
    queryKey: ["userVoiceLikes", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/voice/like/user-likes?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // 사용자 좋아요 클릭 횟수 상태 관리
  const [userTotalLikes, setUserTotalLikes] = useState(0);

  // 사용자 좋아요 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (userLikesData) {
      setUserTotalLikes(userLikesData.totalUserLikes || 0);
    }
  }, [userLikesData]);

  // ✅ 좋아요 개수 조회 useQuery 추가
  const { data: voiceLikesData } = useQuery({
    queryKey: ["voiceLikes", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/voice/like/total?courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // 좋아요 개수를 상태로 관리
  const [totalVoiceLikes, setTotalVoiceLikes] = useState(0);

  // 좋아요 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (voiceLikesData) {
      setTotalVoiceLikes(voiceLikesData.totalLikes || 0);
    }
  }, [voiceLikesData]);

  // ✅ 출석 정보 조회
  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/user/attendance/dashboard?userId=${session?.user?.id}&courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // ! userCoursePoints 에 있는 개별 total 포인트 정보 불러오기 -> 삭제

  // ! 포인트 계산을 위한 useState 추가
  const [totalPoints, setTotalPoints] = useState(0);

  const calculateTotalPoints = () => {
    if (
      isQuizStatsLoading ||
      isVideoDurationLoading ||
      !nativeAudioData ||
      !voiceLikesData ||
      !userLikesData ||
      !attendanceData ||
      totalRecordingAttempts === undefined ||
      !quizStats ||
      !myVoiceOpenData
    ) {
      return null;
    }

    // 포인트 계산 로직 (기존과 동일)
    const VIDEO_POINT_PER_SECOND = 0.5;
    const AUDIO_POINT_PER_ATTEMPT = 1;
    const RECORDING_POINT_PER_ATTEMPT = 20;
    const QUIZ_ATTEMPT_POINT = 3;
    const QUIZ_CORRECT_POINT = 3;
    const ATTENDANCE_POINT = 50;
    const VOICE_LIKE_POINT = 100;
    const USER_VOICE_LIKE_POINT = 20;
    const MY_VOICE_OPEN_POINT = 100; // 내 발음 공개 포인트 가중치

    const videoPoints = totalVideoDuration * VIDEO_POINT_PER_SECOND;
    const audioPoints = (nativeAudioData?.totalAttempts || 0) * AUDIO_POINT_PER_ATTEMPT;
    const recordingPoints = (totalRecordingAttempts || 0) * RECORDING_POINT_PER_ATTEMPT;
    const quizAttemptPoints = (quizStats?.totalAttempts || 0) * QUIZ_ATTEMPT_POINT;
    const quizCorrectPoints = (quizStats?.totalCorrect || 0) * QUIZ_CORRECT_POINT;
    const attendancePoints = (attendanceData?.attendedClassDates || 0) * ATTENDANCE_POINT;
    const voiceLikePoints = (voiceLikesData?.totalLikes || 0) * VOICE_LIKE_POINT;
    const userVoiceLikePoints = (userLikesData?.totalUserLikes || 0) * USER_VOICE_LIKE_POINT;
    const myVoiceOpenPoints = (myVoiceOpenData?.count || 0) * MY_VOICE_OPEN_POINT; // 내 발음 공개 포인트

    return Math.round(
      videoPoints +
        audioPoints +
        recordingPoints +
        quizAttemptPoints +
        quizCorrectPoints +
        attendancePoints +
        voiceLikePoints +
        userVoiceLikePoints +
        myVoiceOpenPoints,
    );
  };

  useEffect(() => {
    const total = calculateTotalPoints();
    if (total === null) return;

    setTotalPoints(total);

    if (selectedCourseId && session?.user?.id) {
      const savePointsToServer = async () => {
        try {
          await axios.post("/api/course-points", {
            courseId: selectedCourseId,
            points: total,
          });
          console.log("포인트가 서버에 업데이트되었습니다:", total);
        } catch (error) {
          console.error("포인트 저장 중 오류 발생:", error);
        }
      };

      savePointsToServer();
    }
  }, [
    totalVideoDuration,
    nativeAudioData?.totalAttempts,
    totalRecordingAttempts,
    quizStats?.totalAttempts,
    quizStats?.totalCorrect,
    attendanceData?.attendedClassDates,
    myVoiceOpenData,
    voiceLikesData?.totalLikes,
    userLikesData?.totalUserLikes,
    isQuizStatsLoading,
    isVideoDurationLoading,
    session?.user?.id,
    selectedCourseId,
  ]);

  // ! ✅ 팀 전체 포인트 정보 불러오기 - calculateTotalTeamPoints 함수 사용
  const { data: teamPointsData, isLoading: isTeamPointsLoading } = useQuery({
    queryKey: ["teamPoints", session?.user?.id, selectedCourseId, totalPoints, voiceLikesData?.totalLikes, userLikesData?.totalUserLikes],
    queryFn: async () => {
      const res = await axios.get(`/api/course-points/team?courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!selectedCourseId,
  });

  // ✅ 팀 포인트 상태 관리
  const [teamPoints, setTeamPoints] = useState(0);

  // ✅ 팀 포인트 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (teamPointsData) {
      setTeamPoints(teamPointsData.totalPoints || 0);
    }
  }, [teamPointsData]);

  // ✅ 팀 전체 학생 수 조회 useQuery 추가
  const { data: studentsData } = useQuery({
    queryKey: ["enrollmentsCount", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return { count: 0 };
      const response = await axios.get(`/api/admin/enrollments/count?courseId=${selectedCourseId}`);
      return response.data;
    },
    enabled: !!selectedCourseId,
  });

  // ✅ 학생 수 가져오기
  const totalStudents = studentsData?.count || 0;

  // ✅ 전체 학생 수와 현재 사용자의 순위 조회
  const { data: rankData, isLoading: isRankLoading } = useQuery({
    queryKey: ["userRank", session?.user?.id, selectedCourseId, totalPoints],
    queryFn: async () => {
      const res = await axios.get(`/api/course-points/rank?courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  const [userRank, setUserRank] = useState(0);

  // ✅ 순위 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (rankData) {
      setUserRank(rankData.rank);
      // setTotalStudents(rankData.totalStudents);
    }
  }, [rankData]);

  // ✅ 아직 듣지 않은 음성 파일 개수 가져오기
  const {
    data: unlistenedVoiceCount,
    refetch: refetchUnlistenedVoiceCount, // refetch 함수 추출
  } = useQuery({
    queryKey: ["unlistenedVoice", session?.user?.id, selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/voice/unlistened/count?courseId=${selectedCourseId}`);
      return res.data.unlistenedCount;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!selectedCourseId,
  });

  // ✅ 해당 강좌에 등록된 공개 음성 파일의 전체 갯수 조회
  const {
    data: voiceFilesData,
    refetch: refetchVoiceFilesData, // refetch 함수 추출
  } = useQuery({
    queryKey: ["courseVoiceFiles", selectedCourseId],
    queryFn: async () => {
      const res = await axios.get(`/api/voice/count?courseId=${selectedCourseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!selectedCourseId,
  });

  // 음성 파일 갯수를 상태로 관리
  const [totalVoiceFiles, setTotalVoiceFiles] = useState(0);

  // 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (voiceFilesData) {
      setTotalVoiceFiles(voiceFilesData.totalFiles || 0);
    }
  }, [voiceFilesData]);

  // 음성 파일 데이터를 새로고침하는 함수
  const refreshVoiceData = () => {
    setIsRefreshing(true);

    Promise.all([refetchUnlistenedVoiceCount(), refetchVoiceFilesData()]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

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
      <h1 className="mb-4 text-center text-2xl font-semibold md:mb-8 md:text-4xl">나의 학습 현황 - {selectedCourseTitle}</h1>

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

          <div className="flex items-center justify-between">
            <div>내 발음 공개</div>
            <div className="font-semibold text-blue-600">{myVoiceOpenCount}회</div>
          </div>

          <div className="flex items-center justify-between">
            <div>좋아요 클릭</div>
            <div className="font-semibold text-blue-600">{userTotalLikes}회</div>
          </div>

          <div className="flex items-center justify-between">
            <div>내 발음 좋아요</div>
            <div className="font-semibold text-blue-600">{totalVoiceLikes}회</div>
          </div>

          <div className="flex items-center justify-between">
            <div>수업 출석 (수업일)횟수</div>
            <div className="font-semibold text-blue-600">
              {attendanceData ? `(${attendanceData.totalClassDates}) ${attendanceData.attendedClassDates}회` : "로딩 중..."}
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-3 border-t border-gray-200"></div>

          {/* 총 획득 포인트 표시 */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">나의 총 획득 포인트</div>
            <div className="flex text-xl font-bold text-indigo-600">
              <FlipCounter value={totalPoints} className={""} />
              <span className="ml-1">P</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <Award className="mr-2 h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Team 활동 현황</h2>
          </div>

          <div className="py-4 text-center">
            {/* TTP 표시 영역 */}
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-indigo-600">Team Total Points</span>
              {isTeamPointsLoading ? (
                <div className="mt-2 animate-pulse">로딩 중...</div>
              ) : (
                <span className="mt-2 text-3xl font-extrabold">
                  <FlipCounter value={teamPoints} className={""} />
                </span>
              )}
            </div>

            {/* 학생 수 표시 영역 */}
            <div className="mt-4 rounded-lg bg-white p-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">나의 팀 기여도</h3>
                <div className="flex text-2xl font-bold text-indigo-600">
                  <FlipCounter
                    value={
                      teamPoints
                        ? (totalPoints / teamPoints) * 100 === 100
                          ? 100
                          : Math.min(parseFloat(((totalPoints / teamPoints) * 100).toFixed(1)), 100)
                        : 0
                    }
                    className={""}
                  />
                  <span className="ml-1">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">나의 순위</h3>
                <div
                  className="cursor-pointer text-2xl font-bold text-indigo-600 hover:text-indigo-800"
                  onClick={() => setIsCoursePointsRankingModalOpen(true)}>
                  {totalPoints ? (
                    <div className="flex items-center">
                      <FlipCounter value={userRank} className={""} />
                      <span className="ml-1">등</span>
                    </div>
                  ) : (
                    <div>기여도 없음</div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">(현재 이 강좌에 등록된 활성 수강생 수 {totalStudents}명)</p>
            </div>
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
                        "flex min-w-[60px] items-center justify-center gap-2 rounded-lg p-3 font-semibold transition md:min-w-[100px]",
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
                      <div className="hidden md:inline">Unit</div>
                      <div>{day}</div>
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

          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <Link
              href={`/favorites/${selectedCourseId}`}
              className="w-full cursor-pointer rounded-lg bg-yellow-400 px-4 py-2 text-center text-white shadow transition hover:bg-yellow-600">
              즐겨찾기 목록
            </Link>
            <button
              className="w-full cursor-pointer rounded-lg bg-cyan-500 px-4 py-2 text-white shadow transition hover:bg-cyan-600"
              onClick={() => setQuizModalOpen(true)}>
              랜덤 퀴즈 풀기
            </button>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">우리는 One Team</h2>
          <div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="font-medium">우리 Class의 팀원들을 만나보세요.</p>
              {/*<p className="mt-2 text-sm text-gray-600">All for One, One for All.</p>*/}
              <button
                className="mt-4 inline-flex cursor-pointer items-center text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => setClassMembersModalOpen(true)}>
                👀우리 팀원들 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            {selectedCourseId === "cmbvjzcqp0005ftv0qs2x5fwg" && (
              <>
                <h2 className="mt-8 mb-4 text-xl font-semibold">팀원들의 발음 게시판</h2>
                {unlistenedVoiceCount > 0 && (
                  <div className="mb-2 flex items-center justify-between">
                    <h6 className={"text-sm"}>아직 듣지 않은 녹음 파일 갯수</h6>
                    <span
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs leading-none font-bold text-red-100"
                      onClick={() => setIsVoiceModalOpen(true)}>
                      {unlistenedVoiceCount}
                    </span>
                  </div>
                )}

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="font-medium">팀원들이 공개한 발음을 들어보고 '👍좋아요'를 눌러 주세요.</p>
                  <button
                    onClick={refreshVoiceData}
                    className="mt-2 flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                    <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
                    새로고침
                  </button>
                  {totalVoiceFiles ? (
                    <button
                      className="mt-4 inline-flex cursor-pointer items-center text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => setIsVoiceModalOpen(true)}>
                      👂발음 들어 보기 ({totalVoiceFiles}) <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  ) : (
                    <div className={"mt-2 text-gray-500"}>아직 등록된 음성 파일이 없습니다.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={"/users/my-courses"}>내 강의 보기</Link>
      </div>

      {/* CoursePointsRanking 모달 */}
      {isCoursePointsRankingModalOpen && (
        <CoursePointsRankingModal
          isOpen={isCoursePointsRankingModalOpen}
          onClose={() => setIsCoursePointsRankingModalOpen(false)}
          courseId={selectedCourseId}
          courseTitle={selectedCourseTitle}
        />
      )}

      {/* ✅ 복습 모달 (framer-motion 적용) */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)} // 모달 외부 클릭 시 닫기
          >
            <motion.div
              className="relative h-svh w-full max-w-lg overflow-auto rounded-lg bg-white px-4 py-10 shadow-lg md:h-fit md:px-6"
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

              <h2 className="mb-4 text-center text-2xl font-semibold">Unit {selectedDay} 학습 내용</h2>

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
                Unit {selectedDay} 학습 시작 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 퀴즈 모달 */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-300/60"
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
                {/* Speaking */}
                <button
                  className="relative w-full rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:brightness-110"
                  onClick={() => router.push(`/quiz/speaking/${selectedCourseId}`)}>
                  <div className="flex animate-pulse items-center justify-center gap-2">
                    <HiOutlineSparkles className="animate-spin-slow h-5 w-5 text-white" />
                    <span className="drop-shadow-md">영어로 말하기 with AI</span>
                    <HiOutlineSparkles className="animate-spin-slow h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -top-2 -left-3 rounded-full bg-red-600 px-2 py-1 text-xs text-white shadow-md">Premium ⭐️</span>
                </button>

                {/* dictation */}
                <button
                  className="hidden w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600"
                  onClick={() => router.push("/quiz/dictation")}>
                  Dictation - 받아쓰기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 팀원 보기 모달 */}
      {selectedCourseId && (
        <ClassMembersModal
          isOpen={isClassMembersModalOpen}
          onClose={() => setClassMembersModalOpen(false)}
          courseId={selectedCourseId}
          courseTitle={selectedCourseTitle}
        />
      )}

      {/* ✅ 음성 모달 추가 */}
      <ClassVoiceModal isOpen={isVoiceModalOpen} closeModal={() => setIsVoiceModalOpen(false)} courseId={selectedCourseId} />
    </div>
  );
}
