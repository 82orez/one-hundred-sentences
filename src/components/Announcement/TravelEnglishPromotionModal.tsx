"use client";

import { useEffect, useState } from "react";
import { TfiAnnouncement } from "react-icons/tfi";
import { FaStar, FaVideo, FaGraduationCap, FaClock } from "react-icons/fa";
import Image from "next/image";

const TravelEnglishPromotionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    // localStorage 에서 '오늘 하루 보지 않기' 선택 여부 확인
    const lastClosed = localStorage.getItem("travel_english_promo_closed");
    const today = new Date().toISOString().split("T")[0];

    if (lastClosed !== today) {
      // 페이지 로드 후 2초 후에 모달 표시
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("travel_english_promo_closed", today);
    }
    setIsOpen(false);
  };

  const handleApplyClick = () => {
    // 카카오톡 채널로 이동
    window.open("http://pf.kakao.com/_yxkcfn", "_blank");
    closeModal();
  };

  const handleDetailClick = () => {
    // 상세 페이지로 이동
    window.open("/course-detail/phil-video-one-to-one", "_blank");
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-sky-50 to-white p-6 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-3 border-b border-sky-200 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
            <FaStar className="text-sky-600" size={16} />
          </div>
          <h2 className="text-xl font-bold text-sky-800">특별 홍보</h2>
        </div>

        {/* 메인 이미지 */}
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl shadow-md">
          <Image src="/images/one_to_one_online_class.png" alt="1:1 화상영어" fill className="object-cover" />
        </div>

        {/* 제목 */}
        <h3 className="mb-3 text-center text-2xl font-bold text-gray-800">프렌딩 여행영어</h3>
        <h4 className="mb-4 text-center text-xl font-semibold text-sky-600">1:1 화상영어</h4>

        {/* 특징 */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-3">
            <FaVideo className="text-sky-600" size={16} />
            <span className="text-sm font-medium">1:1 전담강사</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-3">
            <FaGraduationCap className="text-sky-600" size={16} />
            <span className="text-sm font-medium">필리핀 원어민</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-3">
            <FaClock className="text-sky-600" size={16} />
            <span className="text-sm font-medium">주2회 25분</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-3">
            <FaStar className="text-sky-600" size={16} />
            <span className="text-sm font-medium">12주 과정</span>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 p-4 text-center">
          <p className="text-sm text-gray-600">12주 전체 과정</p>
          <p className="text-2xl font-bold text-orange-600">180,000원</p>
          <p className="text-xs text-gray-500">(총 24회 수업)</p>
        </div>

        {/* 버튼 영역 */}
        <div className="mb-4 flex gap-3">
          <button
            onClick={handleDetailClick}
            className="flex-1 rounded-xl border border-sky-300 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50">
            자세히 보기
          </button>
          <button
            onClick={handleApplyClick}
            className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-yellow-900 shadow-md transition hover:bg-yellow-500">
            문의하기
          </button>
        </div>

        {/* 하단 영역 */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <label className="flex cursor-pointer items-center text-sm text-gray-600 hover:text-gray-800">
            <input type="checkbox" className="mr-2" checked={dontShowToday} onChange={() => setDontShowToday(!dontShowToday)} />
            오늘 하루 보지 않기
          </label>

          <button onClick={closeModal} className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-300">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelEnglishPromotionModal;
