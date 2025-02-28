"use client";
import { useLearningStore } from "@/store/useLearningStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query"; // ✅ React Query v5 import 변경
import axios from "axios";

const HomePage = () => {
  const router = useRouter();
  const { currentDay } = useLearningStore();
  const [progress, setProgress] = useState(0);

  // ✅ React Query v5에서 queryKey 가 배열로 변경됨
  const { data: completedSentences } = useQuery({
    queryKey: ["completedSentences"],
    queryFn: async () => {
      const res = await axios.get("/api/progress");
      return res.data;
    },
  });

  useEffect(() => {
    if (completedSentences) {
      setProgress((completedSentences.length / 100) * 100);
    }
  }, [completedSentences]);

  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h1 className="text-3xl font-bold">하루 5문장, 20일 완성!</h1>
      <p className="mt-2 text-lg text-gray-600">매일 5문장씩 학습하여 영어 100문장을 완성하세요.</p>

      <div className="mt-6 rounded-lg bg-gray-100 p-4 shadow">
        <p className="text-lg font-semibold">진행률: {progress.toFixed(0)}%</p>
        <div className="mt-2 h-4 w-full rounded-full bg-gray-300">
          <div className="h-4 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">오늘의 학습</h2>
        <p className="text-gray-600">Day {currentDay} 학습을 시작하세요.</p>
        <button
          className="mt-4 rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
          onClick={() => router.push(`/learn/${currentDay}`)}>
          학습 시작 🚀
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">추가 학습</h2>
        <p className="text-gray-600">복습하거나 퀴즈를 풀어보세요.</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white shadow transition hover:bg-green-600"
            onClick={() => router.push("/review")}>
            복습하기
          </button>
          <button
            className="rounded-lg bg-yellow-500 px-4 py-2 text-white shadow transition hover:bg-yellow-600"
            onClick={() => router.push("/quiz")}>
            퀴즈 풀기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
