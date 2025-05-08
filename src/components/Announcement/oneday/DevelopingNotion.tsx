"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { TfiAnnouncement } from "react-icons/tfi";

const AnnouncementModalForOneDay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    // localStorage 에서 '오늘 하루 보지 않기' 선택 여부 확인
    const lastClosed = localStorage.getItem("announcement_closed_one_day");
    const today = new Date().toISOString().split("T")[0];

    if (lastClosed !== today) {
      setIsOpen(true);
    }
  }, []);

  const closeModal = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("announcement_closed_one_day", today);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className={"mb-4 flex items-center gap-3 border-b border-gray-400 pb-2"}>
          {/* 제목 */}
          <TfiAnnouncement size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Friending 에서 알립니다.</h2>
        </div>

        {/*/!* 이미지 *!/*/}
        {/*<div className="my-4 flex justify-center">*/}
        {/*  <img*/}
        {/*    src="/images/announcement.png" // 🖼️ 공지사항 이미지 (추가 필요)*/}
        {/*    alt="공지사항"*/}
        {/*    className="h-24 w-24"*/}
        {/*  />          */}
        {/*</div>*/}

        {/* 내용 */}
        <p className="text-center text-lg font-semibold text-gray-900">현재 보고 계시는 싸이트는 개발 중인 싸이트입니다.</p>
        <p className="textarea-md mt-4 text-center text-gray-700">
          따라서 사용자의 로그인 정보, 학습 데이터 등이 사전 예고 없이 언제든지 삭제될 수 있는 점 양해 부탁드립니다.
        </p>
        <p className="textarea-md mt-2 text-center text-gray-500">
          현재 개발 인력의 부족으로 인해 개발 완료 시점이 다소 늦어질 수 있다는 점 또한 양해 부탁드립니다.
        </p>

        {/* 배송지역 버튼 */}
        {/*<div className="mt-4 flex justify-center">*/}
        {/*  <button className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white">전주 / 군산 / 익산</button>*/}
        {/*</div>*/}

        {/* '오늘 하루 보지 않기' + 닫기 버튼 수평 정렬 */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-400 pt-3">
          <label className="text-md flex items-center justify-center text-gray-600 hover:underline">
            <input type="checkbox" className="mr-2" checked={dontShowToday} onChange={() => setDontShowToday(!dontShowToday)} />
            오늘 하루 보지 않기
          </label>

          <button onClick={closeModal} className="rounded bg-gray-300 px-2 py-2 text-sm text-gray-800 hover:underline md:px-4">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModalForOneDay;
