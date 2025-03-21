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
        <div className={"mb-4 flex items-center gap-3 border-b border-gray-200 pb-2"}>
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
        <p className="text-center text-lg font-semibold text-gray-900">택배사 파업으로 인한 배송지연 안내</p>
        <p className="mt-2 text-center text-sm text-gray-700">CJ 대한통운 일부 지역 노조파업으로 인해 배송 및 회수가 지연되고 있습니다.</p>
        <p className="mt-2 text-center text-xs text-gray-500">
          해당 지역의 택배파업이 정상화되기 전까지 배송 및 회수가 다소 늦어질 수 있다는 점 양해 부탁드립니다.
        </p>

        {/* 배송지역 버튼 */}
        <div className="mt-4 flex justify-center">
          <button className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white">전주 / 군산 / 익산</button>
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
      </div>
    </div>
  );
};

export default AnnouncementModalForOneDay;
