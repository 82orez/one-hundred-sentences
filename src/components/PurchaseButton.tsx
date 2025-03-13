"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as PortOne from "@portone/browser-sdk/v2";

interface Props {
  id: string;
  price: number;
}

export function PurchaseButton({ id, price }: Props) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);

      // 결제 요청
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

      alert("구매가 완료되었습니다!");
    } catch (error) {
      console.error("구매 중 오류 발생:", error);
      alert("구매 처리 중 문제가 발생했습니다.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md md:mt-10">
      <div className="rounded-lg border bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">사용권 구매하기</span>
          <span className="text-primary text-lg font-bold">{price.toLocaleString()}원</span>
        </div>
        <Button variant={"default"} onClick={handlePurchase} disabled={isPurchasing} className="w-full py-6 text-lg font-bold">
          {isPurchasing ? "처리중..." : "결제하기"}
        </Button>
      </div>
    </div>
  );
}
