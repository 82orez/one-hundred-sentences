"use client";

import { useLearningStore } from "@/store/useLearningStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { use, useState } from "react";
import clsx from "clsx";
import Link from "next/link";

interface Sentence {
  no: number;
  en: string;
  ko: string;
}

type Props = {
  params: Promise<{ day: string }>;
};

const LearnPage = ({ params }: Props) => {
  const { currentDay, markSentenceComplete, completedSentences } = useLearningStore();
  const { day } = use(params);
  const [visibleTranslations, setVisibleTranslations] = useState<{ [key: number]: boolean }>({});

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

  // 번역 보이기/감추기 토글 함수
  const toggleTranslation = (sentenceId: number) => {
    setVisibleTranslations((prev) => ({
      ...prev,
      [sentenceId]: !prev[sentenceId],
    }));
  };

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Day {day} 학습</h1>
      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          <p className="text-lg font-semibold">{sentence.en}</p>
          <div className={"flex items-center"}>
            {/* Toggle 버튼 */}
            <button
              className="mr-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-black hover:bg-gray-400"
              onClick={() => toggleTranslation(sentence.no)}>
              {visibleTranslations[sentence.no] ? "👁️" : "🚫"}
            </button>
            <p className={clsx("text-gray-600", { "blur-xs": visibleTranslations[sentence.no] })}>{sentence.ko}</p>
          </div>
          <button
            className="mt-2 cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
            onClick={() => {
              markSentenceComplete(sentence.no);
              console.log("sentence.no: ", sentence.no);
              console.log("completedSentences: ", completedSentences);
            }}>
            완료
          </button>
        </div>
      ))}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
};

export default LearnPage;
