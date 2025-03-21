"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaCheck, FaPlay } from "react-icons/fa";
import { queryClient } from "@/app/providers";
import { useSession } from "next-auth/react";
import { useLearningStore } from "@/stores/useLearningStore";
import { FaA, FaMicrophone } from "react-icons/fa6";
import { TbAlphabetKorean } from "react-icons/tb";
import AudioRecorder from "@/components/Recoder";
import { RiCloseLargeFill } from "react-icons/ri";
import Modal from "@/components/Modal";
import { ImYoutube2 } from "react-icons/im";
import { TfiYoutube } from "react-icons/tfi";

interface Sentence {
  no: number;
  en: string;
  ko: string;
  audioUrl?: string;
}

type Props = {
  params: Promise<{ day: string }>;
};

const LearnPage = ({ params }: Props) => {
  const { markSentenceComplete } = useLearningStore();
  const { day } = use(params);
  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({});
  const [visibleEnglish, setVisibleEnglish] = useState<{ [key: number]: boolean }>({});
  const [allEnglishHidden, setAllEnglishHidden] = useState(false); // ✅ 처음에는 영어가 보이도록 설정
  const [showRecorder, setShowRecorder] = useState<number | null>(null); // ✅ 한 번에 하나의 문장에서만 녹음 UI 표시
  const [playingSentence, setPlayingSentence] = useState<number | null>(null); // 현재 재생 중인 문장 추적
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null); // ✅ 문장 객체 저장

  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const videoId = "ARa5yXcnT_w";

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

  // * ✅ 사용자가 완료한 문장 목록 가져오기
  const { data: completedSentences } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
      console.log("completedSentences: ", res.data);
      return res.data.map((item: { sentenceNo: number }) => item.sentenceNo); // 완료된 문장 번호 리스트
    },
    enabled: status === "authenticated" && !!session?.user?.id, // 로그인한 경우만 실행
  });

  // * ✅ 완료된 문장 등록 Mutation
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

  const toggleRecorder = (sentenceNo: number) => {
    setShowRecorder((prev) => (prev === sentenceNo ? null : sentenceNo)); // ✅ 같은 문장을 클릭하면 닫고, 다른 문장을 클릭하면 변경
  };

  // ✅ 녹음 버튼 클릭 시 모달 열기
  const openRecorderModal = (sentence: string) => {
    setSelectedSentence(sentence); // ✅ 문장 정보 저장
  };

  // ✅ 오디오 재생 함수
  const playAudio = (audioUrl?: string, sentenceNo?: number) => {
    if (!audioUrl || sentenceNo === undefined || playingSentence !== null) return; // ✅ 이미 다른 오디오가 재생 중이면 실행 방지

    setPlayingSentence(sentenceNo);

    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => {
      setPlayingSentence(null);
    };
  };

  // ✅ 완료 버튼 클릭 핸들러
  const handleComplete = async (sentenceNo: number) => {
    try {
      await completeSentenceMutation.mutateAsync(sentenceNo);
      markSentenceComplete(sentenceNo);

      // ✅ 모든 문장이 완료되었는지 확인
      const completedSet = new Set(completedSentences);
      completedSet.add(sentenceNo); // 방금 완료한 문장 추가
      console.log("completedSet: ", completedSet);
      const allCompleted = sentences?.every((s) => completedSet.has(s.no));

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

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="relative mx-auto max-w-2xl p-4">
      <h1 className="mb-10 text-2xl font-bold">
        Day - {day}. 학습 {day}일차
      </h1>

      {/* ✅ 전체 영문 가리기/보이기 체크박스 */}
      <div className="absolute top-[3.75rem] right-6 flex items-center justify-end gap-2 md:top-14">
        <input
          type="checkbox"
          id="toggleAllEnglish"
          checked={allEnglishHidden}
          onChange={toggleAllEnglish}
          className="checkbox checkbox-neutral checkbox-sm md:checkbox-md cursor-pointer"
        />
        <label htmlFor="toggleAllEnglish" className="text-md font-semibold md:text-lg">
          훈련 모드
        </label>
      </div>

      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          {/* ✅ 처음에는 모든 영어 문장이 보이는 상태 */}
          <p className={clsx("text-lg font-semibold", { "blur-xs": !visibleEnglish[sentence.no] })}>{sentence.en}</p>

          <p className={clsx("mt-2 text-lg text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>

          {/* ✅ 버튼 그룹 (녹음 UI가 열려있을 때 숨김) */}
          {showRecorder !== sentence.no && (
            <div className="mt-4 flex items-center gap-4">
              {/* 유튜브 재생 링크 */}
              <button
                onClick={() => setShowYoutubeModal(true)}
                className="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 p-2 text-red-600">
                <TfiYoutube size={30} className={"md:hidden"} />
                <ImYoutube2 size={50} className={"hidden md:block"} />
                {/* 강의 보기 */}
              </button>

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
                  className="h-9 min-w-9 cursor-pointer rounded bg-blue-500 p-1 text-white"
                  onClick={() => playAudio(sentence.audioUrl, sentence.no)}
                  disabled={playingSentence !== null} // 다른 문장이 재생 중이면 비활성화
                >
                  <FaPlay size={18} className={"mx-auto"} />
                </button>
              )}

              {/* ✅ 완료 버튼 */}
              <button
                className="hidden w-24 cursor-pointer rounded px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={completedSentences?.includes(sentence.no)}
                onClick={() => handleComplete(sentence.no)}
                style={{
                  backgroundColor: completedSentences?.includes(sentence.no) ? "gray" : "blue",
                }}>
                {completedSentences?.includes(sentence.no) ? "완료된 문장" : "완료"}
              </button>

              {/* ✅ 녹음 버튼 */}
              <button
                className={clsx("h-9 min-w-9 cursor-pointer rounded text-white disabled:cursor-not-allowed", {
                  "bg-gray-300": showRecorder === sentence.no, // ✅ 현재 열려있는 문장이면 회색
                  "bg-red-400": showRecorder !== sentence.no, // ✅ 다른 문장이면 빨간색
                  "bg-yellow-400": completedSentences?.includes(sentence.no), // ✅ 이미 완료한 문장은 노란색
                  "pointer-events-none": playingSentence,
                })}
                disabled={completedSentences?.includes(sentence.no)}
                onClick={() => {
                  toggleRecorder(sentence.no);
                  openRecorderModal(sentence.ko);
                }}>
                {completedSentences?.includes(sentence.no) ? (
                  <FaCheck size={20} className={"mx-auto"} />
                ) : showRecorder === sentence.no ? ( // ✅ 현재 녹음 중인 문장만 아이콘 변경
                  <RiCloseLargeFill size={20} className={"text-red-500"} />
                ) : (
                  <FaMicrophone size={24} className={"mx-auto"} />
                )}
              </button>
            </div>
          )}

          {/* ✅ 녹음 모달 */}
          <Modal isOpen={showRecorder !== null}>
            {showRecorder !== null && (
              <AudioRecorder
                sentenceKo={selectedSentence}
                sentenceNo={showRecorder}
                handleComplete={handleComplete}
                onClose={() => setShowRecorder(null)}
              />
            )}
          </Modal>
        </div>
      ))}

      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] max-w-4xl rounded-lg bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold">강의 동영상</h3>
              <button onClick={() => setShowYoutubeModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
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
