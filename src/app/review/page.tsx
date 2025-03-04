"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // ✅ framer-motion 추가

const ReviewPage = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // ✅ 완료된 학습일 가져오기
  const { data: completedDays, isLoading } = useQuery({
    queryKey: ["completedDays"],
    queryFn: async () => {
      const res = await axios.get("/api/review");
      return res.data.completedDays;
    },
  });

  // ✅ 선택한 학습일의 문장 목록 가져오기
  const { data: sentences, isFetching } = useQuery({
    queryKey: ["reviewSentences", selectedDay],
    queryFn: async () => {
      if (!selectedDay) return [];
      const res = await axios.get(`/api/review/sentences?day=${selectedDay}`);
      return res.data;
    },
    enabled: !!selectedDay,
  });

  // ✅ Esc 키로 모달 닫기 + 포커스 이동
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDay(null);
      }
    };

    if (selectedDay) {
      document.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus(); // 모달 열릴 때 닫기 버튼으로 포커스 이동
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedDay]);

  return (
    <div className="mx-auto max-w-4xl p-6 text-center">
      <h1 className="text-3xl font-bold">복습하기</h1>
      <p className="mt-2 text-lg text-gray-600">이미 학습한 내용을 복습해보세요.</p>

      {/* ✅ 학습일 선택 목록 */}
      {isLoading ? (
        <p className="mt-6 text-gray-500">학습 데이터를 불러오는 중...</p>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {[...Array(20)].map((_, index) => {
            const day = index + 1;
            const isCompleted = completedDays?.includes(day);

            return (
              <button
                key={day}
                className={clsx(
                  "min-w-[80px] rounded-lg p-3 font-bold transition md:min-w-[100px]",
                  isCompleted ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-50",
                )}
                disabled={!isCompleted}
                onClick={() => {
                  if (isCompleted && selectedDay !== day) {
                    setSelectedDay(day);
                  }
                }}>
                {day}일차
              </button>
            );
          })}
        </div>
      )}

      {/* ✅ 모달 창 (framer-motion 적용) */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)} // 모달 외부 클릭 시 닫기
          >
            <motion.div
              className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않도록 방지
            >
              {/* 닫기 버튼 */}
              <button
                ref={closeButtonRef}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedDay(null)}>
                ×
              </button>

              <h2 className="mb-4 text-xl font-semibold">Day {selectedDay} 문장 목록</h2>

              {isFetching ? (
                <p className="text-gray-500">문장을 불러오는 중...</p>
              ) : (
                <ul className="space-y-4">
                  {sentences?.map((sentence: { no: number; en: string; ko: string }) => (
                    <li key={sentence.no} className="rounded-md border p-2">
                      <p className="text-lg font-semibold">{sentence.en}</p>
                      <p className="text-gray-600">{sentence.ko}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* 복습 시작 버튼 */}
              <button
                className="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
                onClick={() => router.push(`/learn/${selectedDay}`)}>
                {selectedDay}일차 복습 시작 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 뒤로가기 버튼 */}
      <div className="mt-10 flex justify-center">
        <Link href="/learn" className="hover:underline focus-visible:ring focus-visible:ring-blue-300">
          Back to My page
        </Link>
      </div>
    </div>
  );
};

export default ReviewPage;
