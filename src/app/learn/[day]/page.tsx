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
import { RiCloseLargeFill } from "react-icons/ri";
import { ImYoutube2 } from "react-icons/im";
import { TfiYoutube } from "react-icons/tfi";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import FlipCounter from "@/components/FlipCounterAnimation";

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

  // 유튜브 모달 상태와 현재 선택된 유튜브 URL 을 저장할 상태 추가
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState<string | null>(null);

  const [youtubeStartTime, setYoutubeStartTime] = useState<number | null>(null);
  const [videoSentenceNo, setVideoSentenceNo] = useState<number | null>(null);

  // 유튜브 관련 상태 변수 추가
  const [youtubeWatchStartTime, setYoutubeWatchStartTime] = useState<number | null>(null);
  const [currentSentenceForYoutube, setCurrentSentenceForYoutube] = useState<number | null>(null);

  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ 해당 일차에 학습할 문장 데이터 가져오기 - todaySentences
  const {
    data: todaySentences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sentences", day],
    queryFn: async () => {
      const res = await axios.get(`/api/learn?day=${day}`);
      console.log("todaySentences: ", res.data);
      return res.data as Sentence[];
    },
  });

  // ✅ 사용자가 학습 완료한 문장 목록 가져오기 - useQuery
  const { data: completedSentences } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
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

  // *✅ useEffect 를 사용하여 completedSentences 가 변경될 때마다 getNextLearningDay 함수를 실행해서 nextDay 업데이트
  useEffect(() => {
    if (completedSentences && status === "authenticated") {
      const calculatedNextDay = getNextLearningDay();

      // 100 문장 모두 완료했는지 확인
      const allCompleted = completedSentences.length >= 100;

      // DB 에 nextDay 와 totalCompleted 업데이트
      updateNextDayInDB(calculatedNextDay, allCompleted);

      // 로컬 상태 업데이트
      setNextDay(calculatedNextDay);
    }
  }, [completedSentences, setNextDay, updateNextDayInDB, status]);

  // ✅ 완료된 문장을 DB 에 등록 - useMutation
  const completeSentenceMutation = useMutation({
    mutationFn: async (sentenceNo: number) => {
      const res = await axios.post("/api/progress", { sentenceNo });
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
    if (currentPageNumber < nextDay) {
      setIsCompletedPage(true);
    }
  }, [currentPageNumber, nextDay]);

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

    const audio = new Audio(audioUrl);
    // * 재생 속도 설정
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
      await completeSentenceMutation.mutateAsync(sentenceNo); // useMutation 사용
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

      // * ui 고려 필요
      if (allCompleted && !isCompletedPage) {
        setTimeout(() => {
          alert(`${day}일차 학습 완료!`);
          // router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  // ✅ 녹음 횟수 데이터를 가져오는 쿼리 추가
  const { data: recordingCounts } = useQuery({
    queryKey: ["recordingCounts", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      const res = await axios.get(`/api/recorder/recording-counter?userId=${session.user.id}`);
      return res.data.reduce((acc: { [key: number]: number }, item: { sentenceNo: number; attemptCount: number }) => {
        acc[item.sentenceNo] = item.attemptCount;
        return acc;
      }, {});
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // ✅ YouTube 재생 처리 함수 수정
  const handlePlayYoutube = (sentence: Sentence) => {
    if (sentence.utubeUrl) {
      setCurrentYoutubeUrl(sentence.utubeUrl);
      setVideoSentenceNo(sentence.no);
      setShowYoutubeModal(true);
      setYoutubeStartTime(Date.now()); // 시청 시작 시간 기록
    }
  };

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

  // 유튜브 버튼 클릭 이벤트 핸들러
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

  // 페이지 네비게이션 핸들러
  const handlePreviousDay = () => {
    if (nextDay !== 1 && currentPageNumber === 1) {
      router.push(`/learn/${nextDay}`);
    } else if (currentPageNumber > 1) {
      router.push(`/learn/${currentPageNumber - 1}`);
    }
  };

  const handleNextDay = () => {
    // 총 학습일(day)의 최대값을 20이라고 가정
    if (currentPageNumber === nextDay) {
      router.push(`/learn/1`);
    } else if (currentPageNumber < 20) {
      router.push(`/learn/${currentPageNumber + 1}`);
    }
  };

  if (isLoading) return <LoadingPageSkeleton />;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="relative mx-auto max-w-2xl p-4">
      {/* 페이지 네비게이션 버튼 */}
      <div className="mt-2 flex items-center justify-between px-4 md:mt-8">
        <button
          onClick={handlePreviousDay}
          disabled={nextDay === 1}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold",
            currentPageNumber <= 1 ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600",
            { invisible: nextDay === 1 },
          )}>
          <FaChevronLeft className={"text-xl md:text-3xl"} />
        </button>

        <h1 className="text-2xl font-bold md:text-4xl">학습 {day}일차</h1>

        <button
          onClick={handleNextDay}
          disabled={nextDay === 1}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold",
            currentPageNumber > 20 || currentPageNumber === nextDay ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600",
            { invisible: nextDay === 1 },
          )}>
          <FaChevronRight className={"text-xl md:text-3xl"} />
        </button>
      </div>

      {/* ✅ 완료 표시 + 훈련 모드 */}
      <div className="mt-4 flex items-center justify-between">
        {/* ✅ 훈련 모드 - 전체 영문 가리기/보이기 체크박스 */}
        <div className="flex items-center justify-end gap-2">
          <input type="checkbox" id="toggleAllEnglish" checked={allEnglishHidden} onChange={toggleAllEnglish} className="toggle cursor-pointer" />
          <label htmlFor="toggleAllEnglish" className="text-md font-semibold md:text-lg">
            훈련 모드
          </label>
        </div>
        {/* ✅ 완료 표시 */}
        <div className="flex items-center">
          <FaCheck size={25} className={"mr-2 rounded bg-yellow-400 p-1 text-white"} />
          <span className="">My Voice</span>
        </div>
      </div>

      {todaySentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          {/* ✅ 처음에는 모든 영어 문장이 보이는 상태 */}
          <p className={clsx("text-lg font-semibold", { "blur-xs": !visibleEnglish[sentence.no] })}>{sentence.en}</p>

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

            {/* ✅ 개별 영문 가리기 버튼 */}
            <button
              className={clsx("flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-black hover:bg-gray-300", {
                "border opacity-50": visibleEnglish[sentence.no],
              })}
              onClick={() => toggleEnglish(sentence.no)}>
              <FaA size={18} />
            </button>

            {/* ✅ 번역 보이기/가리기 버튼 */}
            {/*<button*/}
            {/*  className={clsx("flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-black hover:bg-gray-300", {*/}
            {/*    "border opacity-50": !visibleTranslations[sentence.no],*/}
            {/*  })}*/}
            {/*  onClick={() => toggleTranslation(sentence.no)}>*/}
            {/*  <TbAlphabetKorean size={27} />*/}
            {/*</button>*/}

            {/* ✅ 녹음 버튼 */}
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

            {/* ✅ 완료 버튼 */}
            <button
              className={clsx("h-9 min-w-9 cursor-pointer rounded bg-yellow-400 text-white", {
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
              <div className="relative flex w-[90%] max-w-md items-center justify-center rounded-lg bg-white p-6 shadow-lg">
                <AudioRecorder
                  sentenceKo={todaySentences.find((s) => s.no === selectedSentenceNo)?.ko || ""}
                  sentenceEn={todaySentences.find((s) => s.no === selectedSentenceNo)?.en || ""}
                  sentenceNo={selectedSentenceNo}
                  handleComplete={handleComplete}
                  onClose={() => setSelectedSentenceNo(null)}
                  isCompleted={completedSentences?.includes(selectedSentenceNo)}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 유튜브 모달 */}
      {showYoutubeModal && currentYoutubeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] max-w-4xl rounded-lg bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold">강의 동영상</h3>
              <button onClick={() => handleCloseYoutubeModal()} className="rounded-full p-1 hover:bg-gray-100">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractYoutubeId(currentYoutubeUrl)}?autoplay=1`}
                title="영어 학습 동영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={"/learn"}>Back to My page</Link>
      </div>
    </div>
  );
};

export default LearnPage;
