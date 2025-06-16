// components/Button/PurchaseButtonNew.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useFreeEnrollment } from "@/hooks/useFreeEnrollment";

interface PurchaseButtonProps {
  id?: string;
  title?: string;
  price?: number;
  onValidationError: () => void;
}

export function PurchaseButton({ id, title, price, onValidationError }: PurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();
  const enrollMutation = useFreeEnrollment();

  const handlePurchase = async () => {
    if (!id || !title) {
      onValidationError();
      return;
    }

    try {
      setIsPurchasing(true);

      // 무료 체험반인 경우 수강 신청 처리
      if (id === "testfreecourse2506") {
        await enrollMutation.mutateAsync({
          courseId: id,
          courseTitle: title,
        });
        return;
      }

      // 유료 강좌 결제 처리 로직...
      const response = await PortOne.requestPayment({
        // Store ID 설정
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
        // 채널 키 설정
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: id,
        totalAmount: price,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        redirectUrl: `${window.location.origin}/api/payment/complete`,
      });

      console.log("Purchase-response: ", response);

      if (response?.code !== undefined) {
        alert(response.message);
      } else {
        // 리디렉션 URL 로 바로 이동
        window.location.href = `${window.location.origin}/api/payment/complete?paymentId=${response.paymentId}`;
      }
    } catch (error) {
      console.error("구매 중 오류 발생:", error);
      alert("구매 처리 중 문제가 발생했습니다.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md md:mt-10">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">사용권 구매하기</span>
          <span className="text-primary text-lg font-bold">{price?.toLocaleString()}원</span>
        </div>
        <button onClick={handlePurchase} disabled={isPurchasing} className="btn btn-primary w-full py-6 text-lg font-bold">
          {isPurchasing ? <AiOutlineLoading3Quarters className="animate-spin text-xl" /> : id === "free" ? "시작하기" : "결제하기"}
        </button>
      </div>
    </div>
  );
}
