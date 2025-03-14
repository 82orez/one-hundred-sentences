"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const errorMessages = {
  "no-payment-id": "결제 정보를 찾을 수 없습니다.",
  "api-error": "결제 정보를 확인하는 중 오류가 발생했습니다.",
  unauthorized: "로그인이 필요한 서비스입니다.",
  "payment-failed": "결제가 완료되지 않았습니다.",
  "server-error": "서버 오류가 발생했습니다.",
};

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "server-error";
  const status = searchParams.get("status");

  const errorMessage = errorMessages[reason] || "결제 처리 중 오류가 발생했습니다.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="mb-4 text-center text-5xl text-red-600">❌</div>
          <h1 className="mb-4 text-center text-2xl font-bold">결제 오류</h1>
          <p className="mb-6 text-center">{errorMessage}</p>
          {status && <p className="mb-6 text-sm text-gray-500">상태: {status}</p>}

          <div className="flex flex-col gap-3">
            <Link href="/" passHref>
              <Button className="w-full p-6">홈으로 돌아가기</Button>
            </Link>
            <Link href="/purchase" passHref>
              <Button variant="outline" className="w-full p-6">
                다시 결제하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
