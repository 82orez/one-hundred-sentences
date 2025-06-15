"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdCheckboxOutline } from "react-icons/io";
import { pricePlans } from "@/lib/pricePlans";
import { PurchaseButton } from "@/components/PurchaseButton";
import { useSession } from "next-auth/react";

const PurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState("free");
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // 로그인 상태가 'unauthenticated' 인 경우 로그인 페이지로 리다이렉트
    if (status === "unauthenticated") {
      router.push("/users/sign-in");
    }
  }, [status, router]);

  // 로딩 상태 처리
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  const selectedPlanInfo = pricePlans.find((plan) => plan.id === selectedPlan);
  console.log(`selectedPlanInfo: `, selectedPlanInfo);

  const handlePurchase = () => {
    alert(`You selected the ${selectedPlanInfo?.name}! 결제 연동은 추후 구현됩니다.`);
  };

  // 인증되지 않은 상태라면 페이지 내용을 렌더링하지 않음
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-600 py-3 text-white md:py-6">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-2xl font-extrabold md:text-4xl">요금제를 선택하세요</h1>
          <p className="mt-4 text-lg">필요에 맞는 요금제를 선택하고 시작하세요!</p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold md:mb-8 md:text-3xl">요금 Plan</h2>
          {/* Grid for Plans */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pricePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-full cursor-pointer rounded-lg border p-8 text-center shadow-lg transition-transform duration-300 ease-in-out ${
                  selectedPlan === plan.id ? "scale-105 border-blue-600 bg-blue-50 shadow-2xl" : "border-gray-300 bg-white"
                }`}
                onClick={() => setSelectedPlan(plan.id)}>
                {/* 선택된 경우 체크 아이콘 표시 */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 left-4 text-blue-600">
                    <IoMdCheckboxOutline size={24} />
                  </div>
                )}
                <h3 className={`text-xl font-bold ${selectedPlan === plan.id ? "text-blue-700" : "text-blue-600"}`}>{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
              </div>
            ))}
          </div>

          {/* Purchase Button */}
          {/*<button*/}
          {/*  onClick={handlePurchase}*/}
          {/*  className="mt-6 w-full min-w-52 rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg hover:bg-blue-700 md:mt-12 md:w-auto">*/}
          {/*  {selectedPlanInfo?.price} 결제 하기*/}
          {/*</button>*/}

          <PurchaseButton id={selectedPlanInfo?.id} price={selectedPlanInfo?.price} />
        </div>
      </section>
    </div>
  );
};

export default PurchasePage;
