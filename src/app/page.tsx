"use client";

import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button/Button";
import { CultureMemberButton } from "@/components/Button/CultureMemberButton";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

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

            {/* 무료 체험 안내 */}
            <button
              onClick={openModal}
              className="mb-4 flex min-w-[220px] cursor-pointer items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-lg text-white hover:bg-green-700 md:hidden">
              <span>무료 체험 안내</span>
              <FaArrowRight className="ml-2" />
            </button>
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

                {/* 무료 체험 안내 */}
                <button
                  onClick={openModal}
                  className="hidden cursor-pointer items-center rounded-xl bg-green-600 px-6 py-4 text-lg text-white hover:bg-green-700 md:flex md:w-full md:min-w-[150px] md:justify-center">
                  무료 체험 안내 <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section - 명확하게 구분되도록 디자인 개선 */}
      <section className="bg-opacity-60 mt-16 w-full bg-gradient-to-br from-indigo-900 to-indigo-300 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">프렌딩 공동체, 이렇게 다릅니다.</h2>
          <div className="mx-auto mb-10 h-1 w-20 rounded-full bg-white"></div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🏆</div>
              <h3 className="text-xl font-semibold text-blue-600">목표와 보상</h3>
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

      {/* 무료 체험 모달 */}
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg md:p-8">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">무료 체험 안내</h2>
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-indigo-600"></div>

            <div className="text-gray-700">
              <div className="mb-4 flex items-start">
                <div className="mt-1 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">1</div>
                <p>회원 가입 및 로그인 후 회원 정보에서 본인의 이름과 전화번호를 등록하세요.</p>
              </div>

              <div className="mb-6 flex items-start">
                <div className="mt-1 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">2</div>
                <p>이후, 내 강의 보기에 '무료 체험반'이 자동 생성됩니다.</p>
              </div>
            </div>

            {/*<div className={"flex items-center justify-center"}>*/}
            {/*  <Link href="/users/edit" className={"mx-auto text-gray-500 hover:underline"}>*/}
            {/*    회원 정보 등록*/}
            {/*  </Link>*/}
            {/*</div>*/}

            <div className="mt-4 flex justify-center">
              <button onClick={closeModal} className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                닫기
              </button>
              <button
                className="hidden rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                onClick={() => {
                  closeModal();
                  // 여기에 회원 가입 페이지로 이동하는 로직 추가
                  // 예: router.push('/register');
                }}>
                회원가입
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
