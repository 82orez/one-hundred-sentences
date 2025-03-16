"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentPartialErrorPage() {
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setPaymentId(searchParams.get("paymentId"));
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Card 컴포넌트를 div 로 변경 */}
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-md md:p-6">
        {/* CardContent 대신 일반 div 사용 */}
        <div className="p-4">
          <div className="mb-4 text-center text-5xl text-yellow-500">⚠️</div>
          <h1 className="mb-4 text-center text-2xl font-bold">결제 처리 중 문제가 발생했습니다.</h1>
          <p className="mb-2">결제는 성공적으로 처리되었으나, 시스템 내부에 일시적인 문제가 발생했습니다.</p>
          <p className="mb-6">고객 지원팀에서 확인 후 빠르게 조치해 드리겠습니다.</p>

          {paymentId && (
            <div className="mb-6 rounded-md bg-gray-100 p-3">
              <p className="text-sm">결제 ID: {paymentId}</p>
              <p className="mt-1 text-xs text-gray-500">문의 시 이 번호를 알려주세요</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/learn" passHref>
              <Button className="w-full p-6 text-lg">학습 페이지로 이동하기</Button>
            </Link>
            <Link href="/public" passHref>
              <Button variant="outline" className="w-full p-6 text-lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
