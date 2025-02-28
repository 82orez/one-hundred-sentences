"use client";

import { useLearningStore } from "@/store/useLearningStore";
import { useQuery } from "@tanstack/react-query"; // ✅ React Query v5 import 변경
import axios from "axios";

interface Sentence {
  no: number;
  en: string;
  ko: string;
}

const LearnPage = ({ params }: { params: { day: string } }) => {
  const { currentDay, markSentenceComplete } = useLearningStore();

  // ✅ React Query v5 방식으로 API 요청
  const {
    data: sentences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sentences", params.day],
    queryFn: async () => {
      const res = await axios.get(`/api/learn?day=${params.day}`);
      return res.data as Sentence[];
    },
  });

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Day {params.day} 학습</h1>
      {sentences?.map((sentence) => (
        <div key={sentence.no} className="my-4 rounded-lg border p-4">
          <p className="text-lg font-semibold">{sentence.en}</p>
          <p className="text-gray-600">{sentence.ko}</p>
          <button className="mt-2 rounded bg-blue-500 px-4 py-2 text-white" onClick={() => markSentenceComplete(sentence.no)}>
            완료
          </button>
        </div>
      ))}
    </div>
  );
};

export default LearnPage;
