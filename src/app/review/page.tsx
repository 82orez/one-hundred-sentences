"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";

const ReviewPage = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const router = useRouter();

  // ✅ 완료된 학습일 가져오기
  const { data: completedDays, isLoading } = useQuery({
    queryKey: ["completedDays"],
    queryFn: async () => {
      const res = await axios.get("/api/review");
      return res.data.completedDays;
    },
  });

  // ✅ 선택한 학습일의 문장 목록 가져오기
  const { data: sentences } = useQuery({
    queryKey: ["reviewSentences", selectedDay],
    queryFn: async () => {
      if (!selectedDay) return [];
      const res = await axios.get(`/api/review/sentences?day=${selectedDay}`);
      return res.data;
    },
    enabled: !!selectedDay,
  });

  return (
    <div className="mx-auto max-w-4xl p-6 text-center">
      <h1 className="text-3xl font-bold">복습하기</h1>
      <p className="mt-2 text-lg text-gray-600">이미 학습한 내용을 복습해보세요.</p>

      {/* ✅ 학습일 선택 목록 */}
      <div className="mt-6 grid grid-cols-5 gap-4">
        {[...Array(20)].map((_, index) => {
          const day = index + 1;
          const isCompleted = completedDays?.includes(day);

          return (
            <button
              key={day}
              className={clsx(
                "rounded-lg p-4 font-bold transition",
                isCompleted ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-gray-300 text-gray-500",
              )}
              disabled={!isCompleted}
              onClick={() => setSelectedDay(day)}>
              {day}일차 {isCompleted && "✅"}
            </button>
          );
        })}
      </div>

      {/* ✅ 선택한 학습일 문장 목록 */}
      {selectedDay && (
        <div className="mt-8 text-left">
          <h2 className="text-xl font-semibold">Day {selectedDay} 문장 목록</h2>
          <ul className="mt-4 space-y-2">
            {sentences?.map((sentence: { no: number; en: string; ko: string }) => (
              <li key={sentence.no} className="rounded-md border p-2">
                <p className="font-semibold">{sentence.en}</p>
                <p className="text-gray-600">{sentence.ko}</p>
              </li>
            ))}
          </ul>

          {/* ✅ 복습 시작 버튼 */}
          <button
            className="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
            onClick={() => router.push(`/learn/${selectedDay}`)}>
            {selectedDay}일차 복습 시작 🚀
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
