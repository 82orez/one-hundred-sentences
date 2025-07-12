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
  onValidationErrorAction: () => void;
}

export function PurchaseButtonFree({ id, title, price, onValidationErrorAction }: PurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();
  const enrollMutation = useFreeEnrollment();

  const handlePurchase = async () => {
    if (!id || !title) {
      onValidationErrorAction();
      return;
    }

    const response = await fetch("/api/payment/check-user-info");
    const data = await response.json();

    if (!data.isProfileComplete) {
      if (confirm("아직 실제 이름과 전화 번호가 등록되지 않았습니다. 회원 정보 수정창으로 이동하시겠습니까?")) {
        router.push("/users/edit");
        return;
      }
      return;
    }

    const enrollmentCheck = await fetch(`/api/payment/check-already-enrolled?courseId=${id}`);
    const enrollmentData = await enrollmentCheck.json();

    if (enrollmentData.exists) {
      alert("이미 수강 신청한 강좌입니다.");
      return;
    }

    try {
      setIsPurchasing(true);

      await enrollMutation.mutateAsync({
        courseId: id,
        courseTitle: title,
      });
    } catch (error) {
      console.error("구매 중 오류 발생:", error);
      alert("구매 처리 중 문제가 발생했습니다.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="mx-auto mt-0 max-w-md md:mt-10">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">결제 금액</span>
          <span className="text-primary text-lg font-bold">{price?.toLocaleString()}원</span>
        </div>
        <button onClick={handlePurchase} disabled={isPurchasing} className="btn btn-primary w-full py-6 text-lg font-bold">
          {isPurchasing ? <AiOutlineLoading3Quarters className="animate-spin text-xl" /> : id === "free" ? "시작하기" : "무료 수업 참여 신청"}
        </button>
      </div>
    </div>
  );
}
