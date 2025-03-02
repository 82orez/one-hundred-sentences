"use client";

import { useLearningStore } from "@/store/useLearningStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, use } from "react";
import clsx from "clsx";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

interface Sentence {
  no: number;
  en: string;
  ko: string;
  audioUrl?: string; // ✅ 추가: Supabase MP3 URL
}

type Props = {
  params: Promise<{ day: string }>;
};

const LearnPage = ({ params }: Props) => {
  const { currentDay, markSentenceComplete, completedSentences } = useLearningStore();
  const { day } = use(params);
  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({}); // 기본적으로 숨김
  const [visibleEnglish, setVisibleEnglish] = useState<{ [key: number]: boolean }>({});

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

  // * 영문 보이기/가리기 토글 함수
  const toggleEnglish = (sentenceId: number) => {
    setVisibleEnglish((prev) => ({
      ...prev,
      [sentenceId]: !prev[sentenceId],
    }));
  };

  // 번역 보이기/감추기 토글 함수
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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">
        Day - {day}. 학습 {day}일차
      </h1>
      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          <p className={clsx("text-lg font-semibold", { "blur-xs": visibleEnglish[sentence.no] })}>{sentence.en}</p>
          <p className={clsx("text-lg text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              className="flex w-24 cursor-pointer items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-black hover:bg-gray-300"
              onClick={() => toggleEnglish(sentence.no)}>
              {visibleEnglish[sentence.no] ? "영문 보기" : "영문 가리기"}
            </button>

            <button
              className="flex w-24 cursor-pointer items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-black hover:bg-gray-300"
              onClick={() => toggleTranslation(sentence.no)}>
              {visibleTranslations[sentence.no] ? "번역 보기" : "번역 가리기"}
            </button>

            {sentence.audioUrl && (
              <button className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white" onClick={() => playAudio(sentence.audioUrl)}>
                <FaPlay size={15} />
              </button>
            )}

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
