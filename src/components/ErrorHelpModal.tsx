"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

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
          <h2 className="text-lg font-semibold text-gray-800">※ 학습 어플 오류 발생 시 대처 방법</h2>
          {/*<button onClick={onClose}>*/}
          {/*  <X className="text-gray-600 hover:text-gray-900" />*/}
          {/*</button>*/}
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          <li>로그 아웃 후 다시 로그인 하기</li>
          <li>사용 중인 웹 브라우저를 닫았다가 다시 열기</li>
          <li>핸드폰 전원을 껐다가 다시 켜기</li>
          <li>
            아래 링크를 통해 최신 버전의 <span className="font-semibold">크롬</span> 브라우저를 다운 받아서 설치 및 사용하기
          </li>
          <div className={"flex items-center"}>
            <img src={"/images/chrome.webp"} alt={"chrome"} width={50} />
            <p>Chrome(크롬) 브라우저 다운 받기</p>
          </div>
          <div>
            <ul className={"pl-6"}>
              <li className={"list-disc"}>
                <Link
                  href={"https://play.google.com/store/apps/details?id=com.android.chrome"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"flex items-center gap-1 hover:underline"}>
                  삼성폰(안드로이드폰) <FaArrowRight />
                </Link>
              </li>
              <li className={"mt-1 list-disc"}>
                <Link
                  href={"https://apps.apple.com/kr/app/google-chrome/id535886823?l=ko"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"flex items-center gap-1 hover:underline"}>
                  애플 아이폰(IOS) <FaArrowRight />
                </Link>
              </li>
            </ul>
          </div>
        </ol>

        <div className={"mt-4 flex items-center justify-center"}>
          <button onClick={onClose} className={"btn bg-gray-200 hover:bg-gray-300"}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
