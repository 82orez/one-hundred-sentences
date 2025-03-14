"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="mb-4 flex items-center justify-center gap-2 text-red-600">
            <BiSolidError size={30} />
            <h1 className="text-center text-2xl font-bold">Error</h1>
          </div>
          <p className="mb-6 animate-pulse text-center text-lg">{errorMessage}</p>
          {status && <p className="mb-6 text-sm text-gray-500">상태: {status}</p>}

          <div className="flex flex-col gap-3">
            <Link href="/public" passHref>
              <Button className="w-full p-6 text-lg font-semibold">홈으로 돌아가기</Button>
            </Link>
            <Link href="/purchase" passHref>
              <Button variant="outline" className="w-full p-6 text-lg font-semibold">
                다시 결제하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
