"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaCheck, FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";
import { queryClient } from "@/app/providers";
import { useSession } from "next-auth/react";
import { useLearningStore } from "@/stores/useLearningStore";
import { FaA, FaMicrophone } from "react-icons/fa6";
import { TbAlphabetKorean } from "react-icons/tb";
import AudioRecorder from "@/components/Recoder";
import { RiCloseLargeFill, RiSpeakLine } from "react-icons/ri";
import { ImYoutube2 } from "react-icons/im";
import { TfiYoutube } from "react-icons/tfi";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import FlipCounter from "@/components/FlipCounterAnimation";
import { IoMdCloseCircle } from "react-icons/io";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineFavorite } from "react-icons/md";
import SpeakingQuizComponent from "@/components/SpeakingQuizComponent";
import { useCourseStore } from "@/stores/useCourseStore";

interface Sentence {
  no: number;
  en: string;
  ko: string;
  audioUrl?: string;
  utubeUrl?: string;
}

type Props = {
  params: Promise<{ day: string }>;
};

const LearnPage = ({ params }: Props) => {
  const { day } = use(params);
  const currentPageNumber = parseInt(day, 10); // url 의 파라미터로 받아온 day 를 현재 페이지 no. 로 저장
  const { nextDay, markSentenceComplete, updateNextDayInDB, setNextDay } = useLearningStore();

  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({});
  const [visibleEnglish, setVisibleEnglish] = useState<{ [key: number]: boolean }>({});
  const [allEnglishHidden, setAllEnglishHidden] = useState(false); // ✅ 처음에는 영어가 보이도록 설정
  const [selectedSentenceNo, setSelectedSentenceNo] = useState<number | null>(null); // 선택된 문장 No.
  const [isPlayingSentenceNo, setIsPlayingSentenceNo] = useState<number | null>(null); // 현재 재생 중인 문장 No.
  const [isPlayingMyVoice, setIsPlayingMyVoice] = useState<number | null>(null);
  const [isCompletedPage, setIsCompletedPage] = useState(false);

  // 퀴즈 모달 관련 상태 추가
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizSentenceNo, setQuizSentenceNo] = useState<number | null>(null);

  // 문장별 즐겨찾기 상태를 추적하기 위한 상태 변수
  const [isFavorite, setIsFavorite] = useState<{ [key: number]: boolean }>({});

  // 유튜브 모달 상태와 현재 선택된 유튜브 URL 을 저장할 상태 추가
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState<string | null>(null);

  // 유튜브 관련 상태 변수 추가
  const [youtubeWatchStartTime, setYoutubeWatchStartTime] = useState<number | null>(null);
  const [currentSentenceForYoutube, setCurrentSentenceForYoutube] = useState<number | null>(null);

  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ 퀴즈 모달 닫을 때 즐겨찾기 상태 다시 로드
  useEffect(() => {
    if (!showQuizModal && quizSentenceNo) {
      // 모달이 닫히고 이전에 퀴즈를 표시했던 문장 번호가 있는 경우
      queryClient.invalidateQueries({
        queryKey: ["favoriteStatus", session?.user?.id, quizSentenceNo],
      });

      // 필요하다면 문장 목록 전체 리로드
      queryClient.invalidateQueries({
        queryKey: ["sentences", day],
      });
    }
  }, [showQuizModal, quizSentenceNo, session?.user?.id, day]);

  // ✅ 로그인한 사용자의 Selected 정보 가져오기
  const { data: selectedData } = useQuery({
    queryKey: ["selected", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/selected?userId=${session?.user?.id}`);
      return response.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // useNativeAudioAttempt 훅 사용
  // const nativeAudioAttemptMutation = useNativeAudioAttempt();

  // 퀴즈 완료 핸들러
  // const handleQuizComplete = (sentenceNo: number, isCorrect: boolean) => {
  //   if (isCorrect) {
  //     // 퀴즈를 성공적으로 완료한 경우 문장 완료 표시
  //     // markSentenceComplete(sentenceNo);
  //   }
  //   // 모달 닫기 (또는 다음 문장으로 이동 등의 로직 추가 가능)
  //   setShowQuizModal(false);
  // };

  // ✅ 퀴즈 모달 열기 함수
  const openQuizModal = (sentenceNo: number) => {
    setQuizSentenceNo(sentenceNo);
    setShowQuizModal(true);
  };

  // ✅ 즐겨찾기 토글 핸들러
  const handleFavoriteToggle = (sentenceNo: number, isNowFavorite: boolean) => {
    setIsFavorite((prev) => ({
      ...prev,
      [sentenceNo]: isNowFavorite,
    }));

    // 필요하다면 관련 캐시 무효화
    queryClient.invalidateQueries({
      queryKey: ["sentences", day],
    });
  };

  // ✅ 유닛 제목과 유튜브 URL 불러오기 쿼리 추가
  const { data: unitSubjectAndUtubeUrl, isLoading: isUnitSubjectAndUtubeUrlLoading } = useQuery({
    queryKey: ["unitSubject", day],
    queryFn: async () => {
      const res = await axios.get(`/api/unit-subject?unitNumber=${currentPageNumber}&selectedCourseContents=${selectedData.selectedCourseContents}`);
      return {
        subjectKo: res.data?.subjectKo || null,
        unitUtubeUrl: res.data?.unitUtubeUrl || null,
      };
    },
  });

  // ✅ 해당 일차에 학습할 문장 데이터 가져오기 - todaySentences
  const {
    data: todaySentences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sentences", day],
    queryFn: async () => {
      const res = await axios.get(`/api/learn?day=${day}&selectedCourseContents=${selectedData.selectedCourseContents}`);
      console.log("todaySentences: ", res.data);
      return res.data as Sentence[];
    },
  });

  // ✅ 사용자가 학습 완료한 문장 목록 가져오기 - useQuery
  const { data: completedSentences } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}&courseId=${selectedData.selectedCourseId}`);
      console.log("completedSentences: ", res.data);
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo); // 완료된 문장 번호가 담긴 새로운 배열
    },
    enabled: status === "authenticated" && !!session?.user?.id, // 로그인한 경우만 실행
  });

  // *✅ 학습할 다음 Day(nextDay) 계산 (5문장 완료 기준)
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

  // ! *✅ useEffect 를 사용하여 completedSentences 가 변경될 때마다 getNextLearningDay 함수를 실행해서 nextDay 업데이트
  useEffect(() => {
    if (completedSentences && status === "authenticated") {
      const calculatedNextDay = getNextLearningDay();

      // 100 문장 모두 완료했는지 확인
      const allCompleted = completedSentences.length >= 100;

      // ✅ DB 에 nextDay 와 totalCompleted 업데이트하고 로컬의 nextDay 상태 업데이트
      updateNextDayInDB(calculatedNextDay, allCompleted);
    }
  }, [completedSentences, setNextDay, updateNextDayInDB, status]);

  // ✅ 완료된 문장을 DB 에 등록 - useMutation
  const completeSentenceMutation = useMutation({
    mutationFn: async (params: { sentenceNo: number; courseId: string }) => {
      const res = await axios.post("/api/progress", params);
      console.log("res.data: ", res.data);
      return res.data;
    },
    onSuccess: () => {
      // @ts-ignore
      queryClient.invalidateQueries(["completedSentences"]);
    },
  });

  // ✅ 학습이 완료된 페이지인지 구분
  useEffect(() => {
    if (currentPageNumber < nextDay || (currentPageNumber === nextDay && completedSentences?.length >= 100)) {
      setIsCompletedPage(true);
    }
  }, [currentPageNumber, nextDay]);

  // ✅ 원어민 음성 시청 기록
  const recordNativeAudioAttemptMutation = useMutation({
    mutationFn: async (params: { sentenceNo: number; courseId: string }) => {
      const response = await axios.post("/api/native-audio/attempt", params);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // 필요한 경우 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts", variables.sentenceNo] });
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts"] });
    },
  });

  // ✅ 유튜브 시청 시간 기록을 위해 페이지를 떠날 시에 확인창 - 반드시 close 버튼을 클릭해야 시청 시간이 등록도임.
  useEffect(() => {
    // 유튜브 모달이 열려 있는 경우에만 이벤트 리스너 등록
    if (showYoutubeModal) {
      // 페이지 새로고침/닫기 처리
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        const message = "정말로 떠나시겠습니까? 시청 기록이 저장되지 않을 수 있습니다.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      };

      // 뒤로가기 버튼 처리
      const handlePopState = (e: PopStateEvent) => {
        // 사용자에게 확인창 표시
        const confirmMessage = "정말로 떠나시겠습니까? 시청 기록이 저장되지 않을 수 있습니다";
        if (window.confirm(confirmMessage)) {
          // 사용자가 확인을 누른 경우, 실제로 페이지 뒤로가기 허용
          return true;
        } else {
          // 사용자가 취소를 누른 경우, 현재 페이지에 머물도록 history 조작
          window.history.pushState(null, "", window.location.pathname);
          return false;
        }
      };

      // history 객체에 현재 상태 추가 (뒤로가기 감지 준비)
      window.history.pushState(null, "", window.location.pathname);

      // 이벤트 리스너 등록
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        // 이벤트 리스너 제거
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [showYoutubeModal]);

  // ✅ 오늘 학습할 문장이 로드 되면 모든 영어 문장을 기본적으로 보이게 설정
  useEffect(() => {
    if (todaySentences) {
      const initialEnglishState: { [key: number]: boolean } = {};
      todaySentences.forEach((sentence) => {
        initialEnglishState[sentence.no] = true; // ✅ 처음에는 모든 영어 문장이 보임
      });
      setVisibleEnglish(initialEnglishState);
    }
  }, [todaySentences]);

  // ✅ 개별 영문 보이기/가리기 토글
  const toggleEnglish = (sentenceNo: number) => {
    // ✅ 개별 문장을 보이도록 설정할 때, 전체 가리기 모드를 해제
    if (allEnglishHidden) {
      setAllEnglishHidden(false);
    }

    setVisibleEnglish((prev) => ({
      ...prev,
      [sentenceNo]: !prev[sentenceNo],
    }));
  };

  // ✅ 전체 영문 보이기/가리기 체크박스 토글
  const toggleAllEnglish = () => {
    const newHiddenState = !allEnglishHidden;
    setAllEnglishHidden(newHiddenState);
    setVisibleEnglish((prev) => {
      const newState: { [key: number]: boolean } = {};
      todaySentences?.forEach((sentence) => {
        newState[sentence.no] = !newHiddenState; // ✅ 체크하면 모든 문장 가리기, 해제하면 보이기
      });
      return newState;
    });
  };

  // ✅ 번역 보이기/가리기 토글
  const toggleTranslation = (sentenceId: number) => {
    setVisibleTranslations((prev) => ({
      ...prev,
      [sentenceId]: !prev[sentenceId],
    }));
  };

  // ✅ 클릭(선택)한 문장의 번호를 비교하여, 같은 문장의 버튼을 클릭하면 null, 다른 문장을 클릭하면 선택되 문장 번호를 변경
  // 선택된 문장이 null 이면, Recorder 가 닫히는 시스템
  const toggleRecorder = (sentenceNo: number) => {
    setSelectedSentenceNo((prev) => (prev === sentenceNo ? null : sentenceNo));
  };

  // ✅ 오디오 재생 함수
  const playAudio = (audioUrl?: string, sentenceNo?: number) => {
    if (!audioUrl || sentenceNo === undefined || isPlayingSentenceNo !== null) return; // ✅ 이미 다른 오디오가 재생 중이면 실행 방지

    setIsPlayingSentenceNo(sentenceNo);

    // ✅ 네이티브 오디오 시도 기록 추가
    recordNativeAudioAttemptMutation.mutate({ sentenceNo, courseId: selectedData.selectedCourseId });

    const audio = new Audio(audioUrl);
    // ✅ 재생 속도 설정
    audio.playbackRate = 0.8;

    audio.play();

    audio.onended = () => {
      setIsPlayingSentenceNo(null);
    };
  };

  // ✅ User 가 녹음한 파일 재생 함수
  const handlePlayUserRecording = async (sentenceNo: number) => {
    try {
      // 사용자 녹음 파일 URL 가져오기
      const response = await axios.get(`/api/recorder/user-recording?sentenceNo=${sentenceNo}&userId=${session?.user?.id}`);

      if (response.data?.url) {
        // 오디오 객체를 생성해서 녹음된 파일 재생
        const audio = new Audio(response.data.url);
        audio.play();

        // 현재 재생 중인 문장 번호 설정 (UI 표시를 위해 필요할 경우)
        setIsPlayingMyVoice(sentenceNo);

        // 재생이 끝나면 상태 초기화
        audio.onended = () => {
          setIsPlayingMyVoice(null);
        };
      } else {
        alert("녹음된 파일을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("녹음 파일 재생 중 오류 발생:", error);
      alert("녹음 파일을 재생할 수 없습니다.");
    }
  };

  // ✅ 완료 버튼 클릭 핸들러
  const handleComplete = async (sentenceNo: number) => {
    try {
      await completeSentenceMutation.mutateAsync({ sentenceNo, courseId: selectedData.selectedCourseId }); // useMutation 사용
      // markSentenceComplete(sentenceNo); // useLearningStore 사용

      // ✅ 모든 문장이 완료되었는지 확인
      let allCompleted = false;

      // todaySentences 와 completedSentences 가 모두 존재하는 경우에만 검사
      if (todaySentences && completedSentences) {
        // todaySentences 에서 문장 번호만 추출
        const todaySentenceNumbers = todaySentences.map((sentence) => sentence.no);

        // completedSentences 에 방금 완료한 문장 추가
        const allCompletedSentenceNumbers = [...completedSentences, sentenceNo];

        console.log("todaySentenceNumbers:", todaySentenceNumbers);
        console.log("allCompletedSentenceNumbers:", allCompletedSentenceNumbers);

        // todaySentences 의 모든 번호가 completedSentences 에 포함되어 있는지 확인
        allCompleted = todaySentenceNumbers.every((no) => allCompletedSentenceNumbers.includes(no));
      }

      // ui 고려 필요
      if (allCompleted && !isCompletedPage) {
        setTimeout(() => {
          alert(`${day}일차 학습 완료!`);
          // router.push("/dashboard"); // 강제 라우팅 안하기로 함.
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  // ! ✅ 해당 문장의 녹음 횟수 데이터를 가져오는 쿼리 추가
  const { data: recordingCounts } = useQuery({
    queryKey: ["recordingCounts", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      const res = await axios.get(`/api/recorder/recording-counter?userId=${session.user.id}&courseId=${selectedData.selectedCourseId}`);
      return res.data.reduce((acc: { [key: number]: number }, item: { sentenceNo: number; attemptCount: number }) => {
        acc[item.sentenceNo] = item.attemptCount;
        return acc;
      }, {});
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ 유튜브 모달 열기 함수
  const handleOpenYoutubeModal = (url: string, sentenceNo: number) => {
    setCurrentYoutubeUrl(url);
    setShowYoutubeModal(true);
    setYoutubeWatchStartTime(Date.now());
    setCurrentSentenceForYoutube(sentenceNo);
  };

  // ✅ 유튜브 모달 닫기 함수
  const handleCloseYoutubeModal = async () => {
    setShowYoutubeModal(false);

    // 시청 시간 계산 및 서버에 전송
    if (youtubeWatchStartTime && currentSentenceForYoutube) {
      const duration = (Date.now() - youtubeWatchStartTime) / 1000; // 초 단위로 변환

      try {
        const response = await axios.post("/api/youtube-view", {
          courseId: selectedData.selectedCourseId,
          sentenceNo: currentSentenceForYoutube,
          duration: duration,
        });
        console.log("유튜브 시청 기록:", response.data);
      } catch (error) {
        console.error("유튜브 시청 기록 실패:", error);
      }

      // 상태 초기화
      setYoutubeWatchStartTime(null);
      setCurrentSentenceForYoutube(null);
    }
  };

  // ✅ 유튜브 버튼 클릭 이벤트 핸들러
  const handleYoutubeClick = (url: string, sentenceNo: number) => {
    handleOpenYoutubeModal(url, sentenceNo);
  };

  // 유튜브 URL 에서 ID를 추출하는 유틸리티 함수
  const extractYoutubeId = (url: string): string => {
    // 다양한 유튜브 URL 형식 처리:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID

    // URL 에서 ID 추출하는 정규식
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : url; // 정규 ID가 추출되지 않으면 원래 URL 반환
  };

  // ✅ 페이지 네비게이션 핸들러(전일)
  const handlePreviousDay = () => {
    if (nextDay !== 1 && currentPageNumber === 1) {
      router.push(`/learn/${nextDay}`);
    } else if (currentPageNumber > 1) {
      router.push(`/learn/${currentPageNumber - 1}`);
    }
  };

  // ✅ 페이지 네비게이션 핸들러(후일)
  const handleNextDay = () => {
    // 총 학습일(day)의 최대값을 20이라고 가정
    if (currentPageNumber === nextDay) {
      router.push(`/learn/1`);
    } else if (currentPageNumber < 20) {
      router.push(`/learn/${currentPageNumber + 1}`);
    }
  };

  // ✅ 페이지 로드 시 즐겨찾기 상태를 가져오는 쿼리 추가
  const { data: favoritesData } = useQuery({
    queryKey: ["favorites", session?.user?.id, day],
    queryFn: async () => {
      if (!todaySentences) return {};

      const favoriteStatuses: { [key: number]: boolean } = {};
      for (const sentence of todaySentences) {
        const res = await axios.get(`/api/favorites?sentenceNo=${sentence.no}`);
        favoriteStatuses[sentence.no] = res.data.isFavorite;
      }
      return favoriteStatuses;
    },
    enabled: !!todaySentences && status === "authenticated",
  });

  // ✅ 즐겨찾기 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (favoritesData) {
      setIsFavorite(favoritesData);
    }
  }, [favoritesData]);

  // ✅ 즐겨찾기 토글 뮤테이션
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (sentenceNo: number) => {
      const res = await axios.post("/api/favorites", { sentenceNo });
      return res.data;
    },
    onSuccess: (data, sentenceNo) => {
      // 상태 업데이트
      setIsFavorite((prev) => ({
        ...prev,
        [sentenceNo]: data.isFavorite,
      }));
      // 캐시 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  // ✅ 즐겨찾기 버튼 클릭 핸들러
  const handleToggleFavorite = (sentenceNo: number) => {
    toggleFavoriteMutation.mutate(sentenceNo);
  };

  if (isLoading) return <LoadingPageSkeleton />;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="relative mx-auto max-w-xl p-4">
      {/* 페이지 네비게이션 버튼 */}
      <div className="mt-2 flex items-center justify-between px-0 md:mt-4">
        <button
          onClick={handlePreviousDay}
          disabled={nextDay === 1}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 font-semibold md:px-4",
            currentPageNumber <= 1 ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600",
            { invisible: nextDay === 1 },
          )}>
          <FaChevronLeft className={"text-xl md:text-3xl"} />
        </button>

        <div className="flex flex-col items-center gap-1 md:gap-2">
          <h1 className="text-2xl font-bold md:text-3xl">학습 {day}일차</h1>
          <h1 className="text-xl font-semibold md:text-2xl">{isUnitSubjectAndUtubeUrlLoading ? "Loading" : unitSubjectAndUtubeUrl?.subjectKo}</h1>
        </div>

        <button
          onClick={handleNextDay}
          disabled={nextDay === 1}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 font-semibold md:px-4",
            currentPageNumber > 20 || currentPageNumber === nextDay ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600",
            { invisible: nextDay === 1 },
          )}>
          <FaChevronRight className={"text-xl md:text-3xl"} />
        </button>
      </div>

      {/* ✅ 완료 표시 + 유닛별 유튜브 + 훈련 모드 */}
      <div className="mt-4 flex items-center justify-between">
        {/* ✅ 훈련 모드 - 전체 영문 가리기/보이기 체크박스 */}
        {/*<div className="flex items-center justify-end gap-2">*/}
        {/*  <input type="checkbox" id="toggleAllEnglish" checked={allEnglishHidden} onChange={toggleAllEnglish} className="toggle cursor-pointer" />*/}
        {/*  <label htmlFor="toggleAllEnglish" className="text-md font-semibold md:text-lg">*/}
        {/*    훈련 모드*/}
        {/*  </label>*/}
        {/*</div>*/}

        {/* ✅ Unit Dialogue 재생 유튜브 버튼 */}
        {unitSubjectAndUtubeUrl?.unitUtubeUrl && (
          <button
            className="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-red-600 hover:bg-red-100 md:p-2"
            aria-label="유튜브 재생"
            onClick={() => handleYoutubeClick(unitSubjectAndUtubeUrl.unitUtubeUrl, currentPageNumber)}>
            <TfiYoutube size={30} className={"md:hidden"} />
            <ImYoutube2 size={50} className={"hidden md:block"} />
          </button>
        )}

        {/* ✅ 완료 표시 */}
        <div className="flex items-center">
          <FaCheck size={25} className={"mr-2 rounded bg-cyan-400 p-1 text-white"} />
          <span className="">My Voice</span>
        </div>
      </div>

      {todaySentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          <div className={"flex items-center justify-between gap-4"}>
            <div className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {sentence.no}번 <span className={"hidden md:inline"}>문장</span>
            </div>

            {/* 문장별 스피킹 퀴즈 버튼 */}
            {/*<button*/}
            {/*  onClick={() => openQuizModal(sentence.no)}*/}
            {/*  className="rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">*/}
            {/*  <RiSpeakLine size={40} className={"cursor-pointer rounded-md p-1 hover:bg-gray-200"} />*/}
            {/*</button>*/}

            {/* 즐겨찾기 버튼 */}
            <button className={"flex items-center justify-center gap-2"} onClick={() => handleToggleFavorite(sentence.no)}>
              <div>
                <GrFavorite size={25} className={clsx({ "text-gray-400": !isFavorite[sentence.no] }, { hidden: isFavorite[sentence.no] })} />
                <MdOutlineFavorite size={25} className={clsx({ "text-yellow-400": isFavorite[sentence.no] }, { hidden: !isFavorite[sentence.no] })} />
              </div>
              <span className={"hidden md:inline"}>즐겨찾기</span>
            </button>
          </div>

          {/* ✅ 처음에는 모든 영어 문장이 보이는 상태 */}
          <p className={clsx("mt-4 text-lg font-semibold", { "blur-xs": !visibleEnglish[sentence.no] })}>{sentence.en}</p>
          <p className={clsx("mt-2 text-lg text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>

          {/* ✅ 버튼 그룹 */}
          <div className="mt-4 flex items-center gap-4">
            {/* 유튜브 버튼 */}
            {sentence.utubeUrl && (
              <button
                className="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-red-600 hover:bg-red-100 md:p-2"
                aria-label="유튜브 재생"
                onClick={() => handleYoutubeClick(sentence.utubeUrl!, sentence.no)}>
                <TfiYoutube size={30} className={"md:hidden"} />
                <ImYoutube2 size={50} className={"hidden md:block"} />
              </button>
            )}

            {/* ✅ 오디오 듣기 버튼 */}
            {sentence.audioUrl && (
              <button
                className={clsx("h-9 min-w-9 cursor-pointer rounded bg-blue-500 p-1 text-white", {
                  "opacity-50": isPlayingSentenceNo === sentence.no,
                })}
                onClick={() => playAudio(sentence.audioUrl, sentence.no)}
                disabled={isPlayingSentenceNo !== null} // 다른 문장이 재생 중이면 비활성화
              >
                {isPlayingSentenceNo === sentence.no ? (
                  <div className="flex items-center justify-center">
                    <AiOutlineLoading3Quarters className={"animate-spin"} />
                  </div>
                ) : (
                  <FaPlay size={18} className={"mx-auto"} />
                )}
              </button>
            )}

            {/* ✅ 문장별 스피킹 퀴즈 버튼 */}
            <button
              onClick={() => openQuizModal(sentence.no)}
              className="rounded-md border border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              <RiSpeakLine size={35} className={"cursor-pointer rounded-md p-0.5 hover:bg-gray-200"} />
            </button>

            {/* ✅ 개별 영문 가리기 버튼 */}
            {/*<button*/}
            {/*  className={clsx("flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-black hover:bg-gray-300", {*/}
            {/*    "border opacity-50": visibleEnglish[sentence.no],*/}
            {/*  })}*/}
            {/*  onClick={() => toggleEnglish(sentence.no)}>*/}
            {/*  <FaA size={18} />*/}
            {/*</button>*/}

            {/* ✅ 번역 보이기/가리기 버튼 */}
            {/*<button*/}
            {/*  className={clsx("flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-black hover:bg-gray-300", {*/}
            {/*    "border opacity-50": !visibleTranslations[sentence.no],*/}
            {/*  })}*/}
            {/*  onClick={() => toggleTranslation(sentence.no)}>*/}
            {/*  <TbAlphabetKorean size={27} />*/}
            {/*</button>*/}

            {/* ✅ 숙제 제출 녹음 버튼 */}
            <button
              className={clsx("h-9 min-w-9 cursor-pointer rounded text-white disabled:cursor-not-allowed", {
                "bg-gray-400": completedSentences?.includes(sentence.no),
                "bg-red-400": !completedSentences?.includes(sentence.no),
                "pointer-events-none": isPlayingSentenceNo,
              })}
              onClick={() => {
                toggleRecorder(sentence.no);
              }}>
              {selectedSentenceNo === sentence.no ? ( // ✅ 현재 녹음 중인 문장만 아이콘 변경
                <RiCloseLargeFill size={20} className={"text-red-500"} />
              ) : (
                <FaMicrophone size={24} className={"mx-auto"} />
              )}
            </button>

            {/* ✅ 숙제 제출 완료 버튼 */}
            <button
              className={clsx("h-9 min-w-9 cursor-pointer rounded bg-cyan-400 text-white", {
                hidden: !completedSentences?.includes(sentence.no),
              })}
              disabled={isPlayingMyVoice !== null} // 다른 문장이 재생 중이면 비활성화
              onClick={() => handlePlayUserRecording(sentence.no)}>
              {isPlayingMyVoice === sentence.no ? (
                <div className="flex items-center justify-center">
                  <AiOutlineLoading3Quarters className={"animate-spin"} />
                </div>
              ) : (
                completedSentences?.includes(sentence.no) && <FaCheck size={20} className={"mx-auto"} />
              )}
            </button>

            {/* ✅ 해당 문장 연습 횟수 */}
            <span className="text-md text-gray-500">
              {recordingCounts && recordingCounts[sentence.no] && (
                <FlipCounter value={recordingCounts[sentence.no]} className="text-md text-gray-500" />
              )}
            </span>
          </div>

          {/* ✅ 녹음 모달 - Tailwind CSS 사용 */}
          {selectedSentenceNo && todaySentences?.find((s) => s.no === selectedSentenceNo) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
              <AudioRecorder
                sentenceKo={todaySentences.find((s) => s.no === selectedSentenceNo)?.ko || ""}
                sentenceEn={todaySentences.find((s) => s.no === selectedSentenceNo)?.en || ""}
                sentenceNativeAudioUrl={todaySentences.find((s) => s.no === selectedSentenceNo)?.audioUrl || ""}
                sentenceNo={selectedSentenceNo}
                isPlayingSentenceNo={isPlayingSentenceNo}
                playNativeAudio={playAudio}
                handleComplete={handleComplete}
                onClose={() => setSelectedSentenceNo(null)}
                isCompleted={completedSentences?.includes(selectedSentenceNo)}
                handleToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite}
                courseId={selectedData.selectedCourseId}
              />
            </div>
          )}
        </div>
      ))}

      {/* 유튜브 모달 */}
      {showYoutubeModal && currentYoutubeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white md:bg-black/70 md:backdrop-blur-sm">
          {/* sm 화면에서는 전체 높이를 차지하고, 더 큰 화면에서는 기존 스타일 유지 */}
          <div className="relative flex h-5/6 w-full flex-col rounded-none bg-white p-2 shadow-xl sm:h-auto sm:w-[90%] sm:max-w-4xl sm:rounded-lg sm:p-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 md:mb-4">
              <h3 className={clsx("invisible text-lg font-semibold md:visible")}>강의 동영상</h3>
              <button onClick={() => handleCloseYoutubeModal()} className="cursor-pointer rounded-full hover:bg-gray-100">
                <span className="">
                  <IoMdCloseCircle size={38} className={"text-gray-400 hover:text-gray-500"} />
                </span>
              </button>
            </div>
            {/* 모바일에서는 더 큰 비율로 영상 표시 */}
            <div className="flex flex-grow items-center justify-center">
              <div className="h-full w-full overflow-auto rounded-lg sm:aspect-video sm:h-auto">
                <iframe
                  className="max-sm:scale-x-[calc(1.4)] max-sm:scale-y-[calc(1.4)] max-sm:rotate-90 max-sm:transform"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(currentYoutubeUrl)}?autoplay=1&rel=0&modestbranding=1&controls=0`}
                  title="영어 학습 동영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>

                {/* 영상 하단에만 투명 오버레이 배치 */}
                <div className="absolute right-0 bottom-0 left-0 h-14 bg-transparent" onClick={(e) => e.preventDefault()}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 퀴즈 모달 */}
      {showQuizModal && quizSentenceNo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowQuizModal(false)} />
          <div className="modal-container relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white px-3 py-2 shadow-xl md:py-8">
            <button className="absolute top-7 right-3 float-right text-gray-500 hover:text-gray-700" onClick={() => setShowQuizModal(false)}>
              <IoMdCloseCircle size={28} className={"hover:text-gray-700"} />
            </button>

            <SpeakingQuizComponent
              currentSentenceNumber={quizSentenceNo}
              // onComplete={handleQuizComplete}
              nativeAudioAttemptMutation={recordNativeAudioAttemptMutation}
              selectedCourseId={selectedData.selectedCourseId}
              showNavigation={true}
              onFavoriteToggle={handleFavoriteToggle}
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowQuizModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={`/dashboard/${selectedData.selectedCourseId}`}>Back to My Dashboard</Link>
      </div>
    </div>
  );
};

export default LearnPage;
