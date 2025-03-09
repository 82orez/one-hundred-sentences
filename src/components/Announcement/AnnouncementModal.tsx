"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { TfiAnnouncement } from "react-icons/tfi";
import { useRouter } from "next/navigation";

const AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false); // ✅ 변수명 변경
  const router = useRouter();

  useEffect(() => {
    // localStorage 에서 '더 이상 보지 않기' 선택 여부 확인
    const isClosed = localStorage.getItem("announcement_closed");

    if (isClosed !== "true") {
      setIsOpen(true);
    }
  }, []);

  const closeModal = () => {
    if (dontShowAgain) {
      localStorage.setItem("announcement_closed", "true"); // ✅ 한 번 설정하면 다시 안 보이게
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xl">
      <div className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-2">
          {/* 제목 */}
          <TfiAnnouncement size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Friending 에서 알립니다.</h2>
        </div>

        {/* 내용 */}
        <p className="text-center text-lg font-semibold text-gray-900">처음 로그인 후 회원 정보 등록</p>
        <p className="text-md mt-2 text-center text-gray-700">
          결제 정보 확인을 위해 반드시 정확한 이름과 휴대폰 번호를 아래 링크를 통해 등록해 주셔야 합니다.
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          정확한 이름과 휴대폰 번호가 등록되지 않으면 정상적인 서비스가 이루어지기 어렵다는 점을 양해 부탁드립니다.
        </p>

        {/* 배송지역 버튼 */}
        <div className="mt-4 flex justify-center">
          <button className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white">이름과 휴대폰 번호 등록하기</button>
        </div>

        {/* '더 이상 보지 않기' + 닫기 버튼 수평 정렬 */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <label className="text-md flex items-center justify-center text-gray-600 hover:underline">
            <input type="checkbox" className="mr-2" checked={dontShowAgain} onChange={() => setDontShowAgain(!dontShowAgain)} />더 이상 보지 않기
          </label>

          <button onClick={closeModal} className="rounded bg-gray-300 px-2 py-2 text-sm text-gray-800 hover:underline md:px-4">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
