"use client";

import { useState } from "react";

const PurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const handlePurchase = () => {
    alert(`You selected the ${selectedPlan} plan! 결제 연동은 추후 구현됩니다.`);
    // 결제 로직 또는 외부 결제 API 연동
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-600 py-12 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-extrabold">요금제를 선택하세요</h1>
          <p className="mt-4 text-lg">필요에 맞는 요금제를 선택하고 시작하세요!</p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">요금제</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Plan 0: Free */}
            <div
              className={`cursor-pointer rounded-lg border p-6 shadow-lg ${selectedPlan === "free" ? "border-blue-600" : "border-gray-300"}`}
              onClick={() => setSelectedPlan("free")}>
              <h3 className="text-xl font-bold text-blue-600">Free Plan</h3>
              <p className="mt-4 text-sm text-gray-600">월 $0 - 제한된 기본 기능</p>
            </div>

            {/* Plan 1: Basic */}

            <div
              className={`cursor-pointer rounded-lg border p-6 shadow-lg ${selectedPlan === "basic" ? "border-blue-600" : "border-gray-300"}`}
              onClick={() => setSelectedPlan("basic")}>
              <h3 className="text-xl font-bold text-blue-600">Basic Plan</h3>
              <p className="mt-4 text-sm text-gray-600">월 $10 - 주요 기능 포함</p>
            </div>

            {/* Plan 2: Pro */}
            <div
              className={`cursor-pointer rounded-lg border p-6 shadow-lg ${selectedPlan === "pro" ? "border-blue-600" : "border-gray-300"}`}
              onClick={() => setSelectedPlan("pro")}>
              <h3 className="text-xl font-bold text-blue-600">Pro Plan</h3>
              <p className="mt-4 text-sm text-gray-600">월 $30 - 모든 기능 + 추가 옵션!</p>
            </div>
          </div>
          <button onClick={handlePurchase} className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700">
            구매하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default PurchasePage;
