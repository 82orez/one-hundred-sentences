"use client";

import { useLearningStore } from "@/store/useLearningStore";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

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
  const { markSentenceComplete, completedSentences } = useLearningStore();
  const { day } = use(params);
  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({});
  const [visibleEnglish, setVisibleEnglish] = useState<{ [key: number]: boolean }>({});
  const [allEnglishHidden, setAllEnglishHidden] = useState(false); // ✅ 처음에는 영어가 보이도록 설정
  const router = useRouter();

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
  const toggleEnglish = (sentenceId: number) => {
    // ✅ 개별 문장을 보이도록 설정할 때, 전체 가리기 모드를 해제
    if (allEnglishHidden) {
      setAllEnglishHidden(false);
    }

    setVisibleEnglish((prev) => ({
      ...prev,
      [sentenceId]: !prev[sentenceId],
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

  // ✅ 오디오 재생 함수
  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="relative mx-auto max-w-2xl p-6">
      <h1 className="mb-10 text-2xl font-bold">
        Day - {day}. 학습 {day}일차
      </h1>

      {/* ✅ 전체 영문 가리기/보이기 체크박스 */}
      <div className="absolute top-[4.25rem] right-6 flex items-center justify-end gap-2 hover:underline md:top-16">
        <input type="checkbox" id="toggleAllEnglish" checked={allEnglishHidden} onChange={toggleAllEnglish} className="h-5 w-5 cursor-pointer" />
        <label htmlFor="toggleAllEnglish" className="text-md font-medium md:text-lg">
          전체 영문 가리기
        </label>
      </div>

      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          {/* ✅ 처음에는 모든 영어 문장이 보이는 상태 */}
          <p className={clsx("text-lg font-semibold", { "blur-xs": !visibleEnglish[sentence.no] })}>{sentence.en}</p>

          <p className={clsx("mt-2 text-lg text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>

          <div className="mt-2 flex items-center gap-3">
            {/* ✅ 개별 영문 가리기 버튼 */}
            <button
              className="flex w-24 cursor-pointer items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-black hover:bg-gray-300"
              onClick={() => toggleEnglish(sentence.no)}>
              {visibleEnglish[sentence.no] ? "영문 가리기" : "영문 보기"}
            </button>

            {/* ✅ 번역 보이기/가리기 버튼 */}
            <button
              className="flex w-24 cursor-pointer items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-black hover:bg-gray-300"
              onClick={() => toggleTranslation(sentence.no)}>
              {visibleTranslations[sentence.no] ? "번역 보기" : "번역 가리기"}
            </button>

            {/* ✅ 오디오 듣기 버튼 */}
            {sentence.audioUrl && (
              <button className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white" onClick={() => playAudio(sentence.audioUrl)}>
                <FaPlay size={15} />
              </button>
            )}

            {/* ✅ 완료 버튼 */}
            <button
              className="w-16 cursor-pointer rounded bg-blue-500 px-2 py-1 text-white"
              onClick={() => {
                markSentenceComplete(sentence.no);
                console.log("sentence.no: ", sentence.no);
                console.log("completedSentences: ", completedSentences);
              }}>
              완료
            </button>
          </div>
        </div>
      ))}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
};

export default LearnPage;
