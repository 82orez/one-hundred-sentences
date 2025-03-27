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
import { FaA, FaMicrophone, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { TbAlphabetKorean } from "react-icons/tb";
import AudioRecorder from "@/components/Recoder";
import { RiCloseLargeFill } from "react-icons/ri";
import { ImYoutube2 } from "react-icons/im";
import { TfiYoutube } from "react-icons/tfi";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
  const { markSentenceComplete } = useLearningStore();
  const { day } = use(params);
  // url 의 파라미터로 받아온 day 를 현재 페이지 no. 로 저장
  const currentPageNumber = parseInt(day, 10);
  const { nextDay } = useLearningStore();
  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({});
  const [visibleEnglish, setVisibleEnglish] = useState<{ [key: number]: boolean }>({});
  const [allEnglishHidden, setAllEnglishHidden] = useState(false); // ✅ 처음에는 영어가 보이도록 설정
  const [selectedSentenceNo, setSelectedSentenceNo] = useState<number | null>(null); // 선택된 문장 No.
  const [isPlayingSentenceNo, setIsPlayingSentenceNo] = useState<number | null>(null); // 현재 재생 중인 문장 No.

  // 유튜브 모달 상태와 현재 선택된 유튜브 URL 을 저장할 상태 추가
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState<string | null>(null);

  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ React Query 를 사용하여 문장 데이터 가져오기
  const {
    data: sentences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sentences", day],
    queryFn: async () => {
      const res = await axios.get(`/api/learn?day=${day}`);
      return res.data as Sentence[];
    },
  });

  // ✅ 사용자가 완료한 문장 목록 가져오기
  const { data: completedSentences } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
      console.log("completedSentences: ", res.data);
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo); // 완료된 문장 번호 리스트
    },
    enabled: status === "authenticated" && !!session?.user?.id, // 로그인한 경우만 실행
  });

  // ✅ 완료된 문장 등록 Mutation
  const completeSentenceMutation = useMutation({
    mutationFn: async (sentenceNo: number) => {
      await axios.post("/api/progress", { sentenceNo });
    },
    onSuccess: () => {
      // @ts-ignore
      queryClient.invalidateQueries(["completedSentences"]);
    },
  });

  // ✅ 문장이 로드되면 모든 영어 문장을 기본적으로 보이게 설정
  useEffect(() => {
    if (sentences) {
      const initialEnglishState: { [key: number]: boolean } = {};
      sentences.forEach((sentence) => {
        initialEnglishState[sentence.no] = true; // ✅ 처음에는 모든 영어 문장이 보임
      });
      setVisibleEnglish(initialEnglishState);
    }
  }, [sentences]);

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
      sentences?.forEach((sentence) => {
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

  // ✅ 완료 버튼 클릭 핸들러
  const handleComplete = async (sentenceNo: number) => {
    try {
      await completeSentenceMutation.mutateAsync(sentenceNo);
      markSentenceComplete(sentenceNo);

      // 모든 문장이 완료되었는지 확인
      const completedSet = new Set(completedSentences);
      completedSet.add(sentenceNo); // 방금 완료한 문장 추가
      console.log("completedSet: ", completedSet);
      const allCompleted = sentences?.every((s) => completedSet.has(s.no));

      // * ui 고려 필요
      if (allCompleted) {
        setTimeout(() => {
          alert(`${day}일차 학습 완료!`);
          router.push("/learn");
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  // 유튜브 재생 함수
  const handlePlayYoutube = (sentence: Sentence) => {
    if (sentence.utubeUrl) {
      setCurrentYoutubeUrl(sentence.utubeUrl);
      setShowYoutubeModal(true);
    } else {
      // 유튜브 URL 이 없을 경우 처리 (알림 등)
      alert("이 문장에 대한 유튜브 영상이 없습니다.");
    }
  };

  // 유튜브 모달 닫기 함수
  const closeYoutubeModal = () => {
    setShowYoutubeModal(false);
    setCurrentYoutubeUrl(null);
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
          <span className="">학습 완료 표시</span>
        </div>
      </div>

      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          {/* ✅ 처음에는 모든 영어 문장이 보이는 상태 */}
          <p className={clsx("text-lg font-semibold", { "blur-xs": !visibleEnglish[sentence.no] })}>{sentence.en}</p>

          <p className={clsx("mt-2 text-lg text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>

          {/* ✅ 버튼 그룹 */}
          <div className="mt-4 flex items-center gap-4">
            {/* 유튜브 버튼 추가 */}
            {sentence.utubeUrl && (
              <button
                onClick={() => handlePlayYoutube(sentence)}
                className="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-red-600 md:p-2"
                aria-label="유튜브 재생">
                <TfiYoutube size={30} className={"md:hidden"} />
                <ImYoutube2 size={50} className={"hidden md:block"} />
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
            <button
              className={clsx("flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-black hover:bg-gray-300", {
                "border opacity-50": !visibleTranslations[sentence.no],
              })}
              onClick={() => toggleTranslation(sentence.no)}>
              <TbAlphabetKorean size={27} />
            </button>

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
              className={clsx("h-9 min-w-9 rounded bg-yellow-400 text-white disabled:cursor-not-allowed", {
                hidden: !completedSentences?.includes(sentence.no),
              })}
              disabled={completedSentences?.includes(sentence.no)}>
              {completedSentences?.includes(sentence.no) && <FaCheck size={20} className={"mx-auto"} />}
            </button>
          </div>

          {/* ✅ 녹음 모달 - Tailwind CSS 사용 */}
          {selectedSentenceNo && sentences?.find((s) => s.no === selectedSentenceNo) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
              <div className="relative flex w-[90%] max-w-md items-center justify-center rounded-lg bg-white p-6 shadow-lg">
                <AudioRecorder
                  sentenceKo={sentences.find((s) => s.no === selectedSentenceNo)?.ko || ""}
                  sentenceEn={sentences.find((s) => s.no === selectedSentenceNo)?.en || ""}
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

      {showYoutubeModal && currentYoutubeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] max-w-4xl rounded-lg bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold">강의 동영상</h3>
              <button onClick={() => closeYoutubeModal()} className="rounded-full p-1 hover:bg-gray-100">
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
