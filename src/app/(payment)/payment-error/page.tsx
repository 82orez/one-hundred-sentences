"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BiSolidError } from "react-icons/bi";

const errorMessages = {
  "no-payment-id": "결제 정보를 찾을 수 없습니다.",
  "api-error": "결제 정보를 확인하는 중 오류가 발생했습니다.",
  unauthorized: "로그인이 필요한 서비스입니다.",
  "payment-failed": "결제가 완료되지 않았습니다.",
  "server-error": "서버 오류가 발생했습니다.",
};

export default function PaymentErrorPage() {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setReason(searchParams.get("reason") || "server-error");
      setStatus(searchParams.get("status"));
    }
  }, []);

  const errorMessage = errorMessages[reason] || "결제 처리 중 오류가 발생했습니다.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Card 컴포넌트를 div 로 변경 */}
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        {/* CardContent 대신 일반 div 사용 */}
        <div className="p-4">
          <div className="mb-4 flex items-center justify-center gap-2 text-red-600">
            <BiSolidError size={30} />
            <h1 className="text-center text-2xl font-bold">Error</h1>
          </div>
          <p className="mb-6 animate-pulse text-center text-lg">{errorMessage}</p>
          {status && <p className="mb-6 text-sm text-gray-500">상태: {status}</p>}

          <div className="flex flex-col gap-3">
            <Link href="/" passHref>
              <button className="w-full rounded-md border bg-blue-700 p-2 text-lg font-semibold text-white hover:bg-blue-600">홈으로 돌아가기</button>
            </Link>
            <Link href="/purchase" passHref>
              <button className="w-full rounded-md border p-2 text-lg font-semibold hover:bg-gray-200">다시 결제하기</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
