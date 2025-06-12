"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ErrorHelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">오류 대처 방법</h2>
          <button onClick={onClose}>
            <X className="text-gray-600 hover:text-gray-900" />
          </button>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          <li>사용 중인 웹 브라우저를 닫았다가 다시 열기</li>
          <li>핸드폰 전원을 껐다가 다시 켜기</li>
          <li>
            그래도 안 될 경우에는 구글 플레이 스토어 또는 애플 앱 스토어에서 최신 버전의 <span className="font-semibold">'크롬'</span>을 다운 받아서
            설치 및 사용하기
          </li>
        </ol>
      </div>
    </div>,
    document.body,
  );
}
