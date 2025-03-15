"use client";

import { FiLoader } from "react-icons/fi";

interface LoadingSpinnerProps {
  text?: string; // ✅ 텍스트를 변경할 수 있도록 prop 추가
}

export default function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-100 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-lg">
        {/* React Icons 로딩 아이콘 + Tailwind 애니메이션 적용 */}
        <FiLoader className="h-12 w-12 animate-spin text-gray-500" />
        <p className="mt-4 animate-pulse text-lg font-semibold text-gray-700">{text}</p>
      </div>
    </div>
  );
}
