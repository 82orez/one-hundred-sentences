"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Users, Plane } from "lucide-react";
import Link from "next/link";

const PerthTourPromotionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    // localStorage에서 '오늘 하루 보지 않기' 선택 여부 확인
    const lastClosed = localStorage.getItem("perthTour_closed_one_day");
    const today = new Date().toISOString().split("T")[0];

    if (lastClosed !== today) {
      setIsOpen(true);
    }
  }, []);

  const closeModal = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("perthTour_closed_one_day", today);
    }
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleBackdropClick}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* 닫기 버튼 */}
            <button onClick={closeModal} className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={20} />
            </button>

            {/* 헤더 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Plane className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">🌟 특별한 기회! 🌟</h2>
              <h3 className="mb-4 text-2xl font-bold text-emerald-600">서호주 스피킹 투어</h3>
            </div>

            {/* 내용 */}
            <div className="space-y-4 text-sm text-gray-700">
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xl font-bold text-red-600">🔥 30% 인하된 특별가! 🔥</p>
                {/*<p className="mt-2 text-red-500">호주 정부의 공식 지원으로 가능.</p>*/}
              </div>

              <div className="hidden space-y-3 text-base">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span>호주 퍼스(Perth) 16박 17일</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span>2025.01.24 ~ 02.09</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <span>영어 수업 + 홈스테이 + 현지 투어</span>
                </div>
              </div>

              <div className="hidden rounded-xl bg-emerald-50 p-4">
                <h4 className="mb-2 font-semibold text-emerald-800">포함 혜택</h4>
                <ul className="space-y-1 text-base">
                  <li>✅ 필리핀 1:1 화상영어 수업 12주</li>
                  <li>✅ 온라인 여행영어 100문장 4주</li>
                  {/*<li>✅ 월 1회 오프라인 모임 (총 3회)</li>*/}
                  {/*<li>✅ 전문 강사 직접 인솔</li>*/}
                </ul>
              </div>

              <div className="hidden text-center">
                <p className="text-lg font-bold text-gray-900">총 370만원</p>
                <p className="text-base text-gray-500">(항공료 별도)</p>
              </div>
            </div>

            <p className="mt-2 text-center text-base text-gray-900">이 기회를 놓치지 마세요!</p>

            {/* 버튼 */}
            <div className="mt-6 space-y-3">
              <Link
                href="/course-detail/perth"
                onClick={closeModal}
                className="block w-full rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700">
                자세한 정보 보기
              </Link>
            </div>

            {/* '오늘 하루 보지 않기' + 닫기 버튼 수평 정렬 */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
              <label className="text-md flex items-center justify-center text-gray-600 hover:underline">
                <input type="checkbox" className="mr-2" checked={dontShowToday} onChange={() => setDontShowToday(!dontShowToday)} />
                오늘 하루 보지 않기
              </label>

              <button onClick={closeModal} className="rounded bg-gray-300 px-2 py-2 text-sm text-gray-800 hover:underline md:px-4">
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerthTourPromotionModal;
