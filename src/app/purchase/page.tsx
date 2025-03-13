"use client";

import { useState } from "react";
import { IoMdCheckboxOutline } from "react-icons/io";

const PurchasePage = () => {
  // 요금제 데이터를 중앙에서 관리
  const plans = [
    { id: "free", name: "Free Plan", price: "$0", description: "월 $0 - 제한된 기본 기능" },
    { id: "basic", name: "Basic Plan", price: "$10", description: "월 $10 - 주요 기능 포함" },
    { id: "pro", name: "Pro Plan", price: "$30", description: "월 $30 - 모든 기능 + 추가 옵션!" },
  ];

  const [selectedPlan, setSelectedPlan] = useState("basic");

  const handlePurchase = () => {
    alert(`You selected the ${selectedPlan} plan! 결제 연동은 추후 구현됩니다.`);
  };

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
          <h2 className="mb-4 text-3xl font-bold md:mb-8">요금 Plan</h2>
          {/* Grid for Plans */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
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
          <button
            onClick={handlePurchase}
            className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg hover:bg-blue-700 md:mt-12 md:w-auto">
            구매하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default PurchasePage;
