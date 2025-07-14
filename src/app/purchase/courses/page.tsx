"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdCheckboxOutline } from "react-icons/io";
import { pricePlansForCourse } from "@/lib/pricePlansForCourse";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaHandPointRight } from "react-icons/fa";
import { PurchaseButtonCourse } from "@/components/Button/PurchaseButtonCourse";
import ClassScheduleModal from "@/components/ClassScheduleModal";

const PurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState<{
    id: string;
    title: string;
    pricePerHour: number;
  } | null>(null);
  const router = useRouter();
  const { status } = useSession();

  // useEffect(() => {
  //   // 로그인 상태가 'unauthenticated' 인 경우 로그인 페이지로 리다이렉트
  //   if (status === "unauthenticated") {
  //     router.push("/users/sign-in");
  //   }
  // }, [status, router]);

  // 로딩 상태 처리
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  const selectedPlanInfo = pricePlansForCourse.find((plan) => plan.id === selectedPlan);
  console.log(`selectedPlanInfo: `, selectedPlanInfo);

  // 수업일정 보기 버튼 클릭 핸들러
  const handleScheduleClick = async (courseId: string, courseTitle: string, coursePricePerHour: number) => {
    try {
      // 사용자 정보 확인
      const response = await fetch("/api/payment/check-user-info");
      const data = await response.json();

      if (!data.isProfileComplete) {
        if (confirm("아직 실제 이름과 전화 번호가 등록되지 않았습니다. 회원 정보 수정창으로 이동하시겠습니까?")) {
          router.push("/users/edit");
          return;
        }
        return;
      }

      // 사용자 정보가 완료되었다면 모달 열기
      setSelectedCourseForSchedule({ id: courseId, title: courseTitle, pricePerHour: coursePricePerHour });
      setIsModalOpen(true);
    } catch (error) {
      console.error("사용자 정보 확인 중 오류:", error);
      toast.error("사용자 정보를 확인하는 중 오류가 발생했습니다.");
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourseForSchedule(null);
  };

  // 인증되지 않은 상태라면 페이지 내용을 렌더링하지 않음
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-600 py-3 text-white md:py-6">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="hidden text-2xl font-extrabold md:block md:text-4xl">강좌를 선택해 주세요.</h1>
          <p className="mt-1 text-lg md:mt-4">원하는 강좌를 선택하고 시작하세요!</p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-5xl px-4 text-center whitespace-pre-line">
          {/*<h2 className="mb-4 text-2xl font-bold md:mb-8 md:text-3xl">대국민 완전 무료 시리즈!</h2>*/}

          {/* Grid for Plans */}
          {/*<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">*/}
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-stretch md:gap-8">
            {pricePlansForCourse.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-full max-w-80 rounded-lg border p-8 text-center shadow-lg transition-transform duration-300 ease-in-out ${
                  selectedPlan === plan.id ? "scale-105 border-blue-600 bg-blue-50 shadow-2xl" : "border-gray-300 bg-white"
                }`}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}>
                {/* 선택된 경우 체크 아이콘 표시 */}
                {/*{selectedPlan === plan.id ? (*/}
                {/*  <div className="absolute top-4 left-4 text-blue-600">*/}
                {/*    <IoMdCheckboxOutline size={24} />*/}
                {/*  </div>*/}
                {/*) : (*/}
                {/*  <div className="absolute top-4 left-4 text-blue-600">*/}
                {/*    <MdCheckBoxOutlineBlank size={24} />*/}
                {/*  </div>*/}
                {/*)}*/}

                {/* 강좌 제목 표시 부분 */}
                <h3 className={`text-xl font-bold ${selectedPlan === plan.id ? "text-blue-700" : "text-blue-600"}`}>{plan.title}</h3>

                <div className={"mt-4 border-b"}></div>

                {/* 강좌 특징 소개 부분*/}
                <div className="mt-4 text-gray-600">
                  <ul className="list-disc space-y-4 pl-4 text-left">
                    {plan.description.map((item, index) => (
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

                {plan.introPage && (
                  <div
                    className={"mt-8 mb-0 flex cursor-pointer items-center justify-center gap-2 font-semibold text-blue-600 hover:underline"}
                    onClick={() => router.push(plan.introPage)}>
                    <FaHandPointRight />
                    <div>강의 소개 페이지 보기</div>
                  </div>
                )}

                <button
                  className={
                    "btn btn-primary mx-auto mt-8 max-w-11/12 rounded-lg border-t border-gray-200 p-6 text-[1rem] shadow-lg md:absolute md:right-0 md:bottom-3 md:left-0 md:z-50"
                  }
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                    handleScheduleClick(plan.id, plan.title, plan.pricePerHour);
                  }}>
                  수강 신청 시작하기
                </button>
              </div>
            ))}
          </div>

          {/*<PurchaseButtonCourse*/}
          {/*  id={selectedPlanInfo?.id}*/}
          {/*  title={selectedPlanInfo?.title}*/}
          {/*  price={selectedPlanInfo?.price}*/}
          {/*  onValidationErrorAction={() => toast.error("강좌를 선택해 주세요.")}*/}
          {/*/>*/}

          <div className={"mt-8 mb-4 flex justify-center md:mt-12"}>
            <Link href="/" className="flex items-center text-blue-500 hover:underline">
              <ArrowLeft className="mr-1" size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* 수업일정 모달 */}
      {selectedCourseForSchedule && (
        <ClassScheduleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          courseId={selectedCourseForSchedule.id}
          courseTitle={selectedCourseForSchedule.title}
          coursePricePerHour={selectedCourseForSchedule.pricePerHour}
        />
      )}
    </div>
  );
};

export default PurchasePage;
