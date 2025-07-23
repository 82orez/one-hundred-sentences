"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdCheckboxOutline } from "react-icons/io";
import { pricePlans } from "@/lib/pricePlans";
import { useSession } from "next-auth/react";
import { PurchaseButtonFree } from "@/components/Button/PurchaseButtonFree";
import toast from "react-hot-toast";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaHandPointRight, FaSignInAlt } from "react-icons/fa";

const PurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-600 py-3 text-white md:py-6">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-2xl font-extrabold md:text-4xl">강좌를 선택해 주세요.</h1>
          <p className="mt-1 hidden text-lg md:mt-4 md:block">원하는 강좌를 선택하고 시작하세요!</p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-6 pb-32 md:pb-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold md:mb-8 md:text-3xl">대국민 완전 무료 시리즈!</h2>

          {/* Grid for Plans */}
          {/*<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">*/}
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-stretch md:gap-6">
            {pricePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-full max-w-80 cursor-pointer rounded-lg border p-8 text-center shadow-lg transition-transform duration-300 ease-in-out ${
                  selectedPlan === plan.id ? "scale-105 border-blue-600 bg-blue-50 shadow-2xl" : "border-gray-300 bg-white"
                }`}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}>
                {/* 선택된 경우 체크 아이콘 표시 */}
                {selectedPlan === plan.id ? (
                  <div className="absolute top-4 left-4 text-blue-600">
                    <IoMdCheckboxOutline size={24} />
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 text-blue-600">
                    <MdCheckBoxOutlineBlank size={24} />
                  </div>
                )}

                {/* 강좌 제목 표시 부분 */}
                <h3 className={`text-xl font-bold whitespace-pre-line ${selectedPlan === plan.id ? "text-blue-700" : "text-blue-600"}`}>
                  {plan.title}
                </h3>

                <div className={"mt-4 border-b"}></div>

                {/* 강좌 특징 소개 부분*/}
                <div className="mt-4 text-gray-600">
                  <ul className="list-disc space-y-4 pl-4 text-left">
                    {plan.description?.map((item, index) => (
                      <li key={index}>
                        {typeof item === "string" ? (
                          <span className="font-semibold">{item}</span>
                        ) : (
                          <div>
                            <span className="font-semibold">{item.title}</span>
                            <ul className="mt-1 -ml-2 space-y-1">
                              {item.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="list-none text-[0.95rem]">
                                  - {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* introPage가 있는 강좌만 강의 소개 페이지 보기 링크 표시 */}
                {plan.introPage && (
                  <div
                    className={"mt-8 flex cursor-pointer items-center justify-center gap-2 font-semibold text-blue-600 underline"}
                    onClick={() => router.push(plan.introPage)}>
                    <FaHandPointRight size={22} />
                    <div>강의 소개 페이지 보기</div>
                  </div>
                )}

                {plan.openChatUrl && (
                  <div
                    className={"mt-4 flex cursor-pointer items-center justify-center gap-2 font-semibold text-amber-500 underline"}
                    onClick={() => window.open(plan.openChatUrl, "_blank")}>
                    <FaSignInAlt size={22} />
                    <div>오픈 채팅방 참여하기</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 데스크톱에서만 보이는 버튼 */}
          <div className="hidden md:block">
            <PurchaseButtonFree
              id={selectedPlanInfo?.id}
              title={selectedPlanInfo?.title}
              price={selectedPlanInfo?.price}
              onValidationErrorAction={() => toast.error("강좌를 선택해 주세요.")}
            />
          </div>

          <div className={"mt-8 mb-4 flex justify-center md:mt-6 md:mb-0"}>
            <Link href="/" className="flex items-center text-blue-500 hover:underline">
              <ArrowLeft className="mr-1" size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* 모바일에서만 보이는 고정 버튼 */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white p-0 shadow-lg md:hidden">
        <PurchaseButtonFree
          id={selectedPlanInfo?.id}
          title={selectedPlanInfo?.title}
          price={selectedPlanInfo?.price}
          onValidationErrorAction={() => toast.error("강좌를 선택해 주세요.")}
        />
      </div>
    </div>
  );
};

export default PurchasePage;
