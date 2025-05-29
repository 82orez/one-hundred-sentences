"use server";

import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button/Button";
import { CultureMemberButton } from "@/components/Button/CultureMemberButton";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-600 to-indigo-400 text-white">
      {/* 헤더 영역 */}
      <header className="mb-8 px-4 pt-10 text-center md:mb-12 md:pt-16">
        <h1 className="mb-3 text-2xl font-bold drop-shadow-lg md:mb-8 md:text-5xl">세 달만에 끝내는 "여행영어 100문장"</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-200 md:mb-2 md:text-xl">효과적인 영어 학습을 위한 최고의 플랫폼!</p>
        <p className="mx-auto max-w-2xl text-lg text-gray-200 md:text-xl">100문장을 단기간에 암기하고 영어 실력을 향상하세요.</p>
      </header>

      {/* 메인 카드 영역 */}
      <div className="w-full px-4 md:px-8">
        <Card className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-2xl bg-white p-6 text-gray-800 shadow-xl md:flex-row">
          <Image src="/images/english-learning.png" width={300} height={300} alt="영어 학습" className="mb-4 rounded-lg shadow-md md:mr-6 md:mb-0" />

          {/* 모바일 모드 */}
          <div>
            <CultureMemberButton className="mb-4 flex min-w-[220px] cursor-pointer items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700 md:hidden">
              문화센터 등록 회원 <FaArrowRight className="ml-2" />
            </CultureMemberButton>

            <Button className="pointer-events-none mb-4 flex min-w-[220px] cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-lg text-white opacity-50 hover:bg-indigo-700 md:hidden">
              <span>개인 회원</span>
              <FaArrowRight className="ml-2" />
            </Button>

            <Button className="pointer-events-none mb-4 flex min-w-[220px] cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-lg text-white opacity-50 hover:bg-indigo-700 md:hidden">
              <span>무료 체험하기</span>
              <FaArrowRight className="ml-2" />
            </Button>
          </div>

          <CardContent className="text-center md:text-left">
            <h2 className="mb-1 text-xl font-semibold md:mb-3 md:text-2xl">영어 100문장으로 영어의 기초를 완성하세요.</h2>
            <p className="mb-4 text-gray-600">반복 학습과 체계적인 암기법을 통해 누구나 쉽게 영어 실력을 높일 수 있습니다.</p>

            {/* pc 모드 */}
            <div className={"hidden md:flex md:w-full md:flex-col md:items-center"}>
              <div className={"hidden md:flex md:max-w-[350px] md:flex-col md:items-center md:justify-between md:gap-4"}>
                <div className={"flex justify-center md:w-full md:justify-between md:gap-6"}>
                  <CultureMemberButton className="hidden cursor-pointer items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700 md:flex md:min-w-[150px] md:gap-0">
                    <div className={"flex flex-col items-center"}>
                      <span>문화센터</span>
                      <span>등록 회원</span>
                    </div>
                    <FaArrowRight className="ml-2" />
                  </CultureMemberButton>

                  <Button className="pointer-events-none hidden cursor-pointer items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg text-white opacity-50 hover:bg-indigo-700 md:flex md:min-w-[150px]">
                    개인 회원 <FaArrowRight className="ml-2" />
                  </Button>
                </div>

                <Button className="pointer-events-none hidden cursor-pointer items-center rounded-xl bg-indigo-600 px-6 py-6 text-lg text-white opacity-50 hover:bg-indigo-700 md:flex md:w-full md:min-w-[150px] md:justify-center">
                  무료 체험 신청하기 <FaArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section - 명확하게 구분되도록 디자인 개선 */}
      <section className="bg-opacity-60 mt-16 w-full bg-gradient-to-br from-indigo-900 to-indigo-300 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">주요 기능</h2>
          <div className="mx-auto mb-10 h-1 w-20 rounded-full bg-white"></div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-600">학습 진도 추적</h3>
              <p className="mt-2 text-gray-600">하루하루 학습 진도를 추적하여 너무 오래된 내용을 복습하는 데 도움을 줍니다.</p>
            </div>

            {/* Feature 2 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-600">사용자 맞춤</h3>
              <p className="mt-2 text-gray-600">개인별 학습 데이터를 기반으로 한 복습 추천 시스템.</p>
            </div>

            {/* Feature 3 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-600">모바일 최적화</h3>
              <p className="mt-2 text-gray-600">어디서나 복습 가능하도록 모바일에서 완벽히 작동합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
