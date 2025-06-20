"use client";

import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button/Button";
import { CultureMemberButton } from "@/components/Button/CultureMemberButton";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    // 캐러셀의 각 아이템을 관찰하기 위한 Intersection Observer 설정
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 보이는 슬라이드의 id 에서 번호 추출하여 currentSlide 업데이트
            const slideId = entry.target.id;
            const slideNumber = parseInt(slideId.replace("feature", ""));
            setCurrentSlide(slideNumber);
          }
        });
      },
      {
        threshold: 0.5, // 슬라이드가 50% 이상 보일 때 감지
      },
    );

    // 각 캐러셀 아이템에 observer 적용
    const carouselItems = document.querySelectorAll(".carousel-item");
    carouselItems.forEach((item) => {
      observer.observe(item);
    });

    // 컴포넌트 언마운트 시 observer 해제
    return () => {
      carouselItems.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // 슬라이드 변경 함수 추가
  const changeSlide = (slideNumber) => {
    setCurrentSlide(slideNumber);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-600 to-indigo-400 text-white">
      {/* 헤더 영역 */}
      <header className="mb-8 px-4 pt-8 text-center md:mb-12 md:pt-12">
        <h1 className="mb-3 text-xl font-bold drop-shadow-lg md:mb-8 md:text-5xl">Friending Makes EngPossible!</h1>
        {/*<h1 className="mb-1 text-xl font-semibold drop-shadow-lg md:mb-4 md:text-4xl">프렌딩 잉파서블!</h1>*/}
        <h1 className="mb-3 text-xl font-semibold drop-shadow-lg md:mb-8 md:text-4xl">‘함께하면’ 영어가 가능해집니다.</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-200 md:mb-2 md:text-xl">혼자서는 어려웠던 영어, 이젠 프렌딩에서 함께 배워요.</p>
        <p className="mx-auto max-w-2xl text-lg text-gray-200 md:text-xl">공동체에 참여하고, 재미있고 빠르게!</p>
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
              <span>개인 회원(준비 중)</span>
              <FaArrowRight className="ml-2" />
            </Button>

            {/* 무료 체험 안내 */}
            {/*<button*/}
            {/*  onClick={openModal}*/}
            {/*  className="mb-4 flex min-w-[220px] cursor-pointer items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-lg text-white hover:bg-green-700 md:hidden">*/}
            {/*  <span>무료 체험 안내</span>*/}
            {/*  <FaArrowRight className="ml-2" />*/}
            {/*</button>*/}

            {/* 무료 체험 신청 안내 */}
            <Link
              href={"/purchase"}
              className="mb-4 flex min-w-[220px] cursor-pointer items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-lg text-white hover:bg-green-700 md:hidden">
              <span>무료 체험 신청</span>
              <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <CardContent className="text-center md:text-left">
            <h2 className="mb-1 text-xl font-semibold md:mb-3 md:text-2xl">공항, 호텔, 길 찾기... 말 한마디가 어려우셨다면?</h2>
            <p className="mb-1 text-gray-600">같이 배우고, 같이 말해보는 여행영어 공동체에 참여해보세요!</p>
            <p className="text-gray-600 md:mb-6">세 달 만에 여행 100문장을 '함께' 완성하여 영어의 기초를 완성하세요.</p>
            {/*<p className="mb-1 text-gray-600">공항, 호텔, 길 찾기... 말 한마디가 어려우셨다면?</p>*/}

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
                    {/*개인 회원 <FaArrowRight className="ml-2" />*/}
                    <div className={"flex flex-col items-center"}>
                      <span>개인 회원</span>
                      <span>(준비 중)</span>
                    </div>
                    <FaArrowRight className="ml-2" />
                  </Button>
                </div>

                {/* 무료 체험 안내 */}
                {/*<button*/}
                {/*  onClick={openModal}*/}
                {/*  className="hidden cursor-pointer items-center rounded-xl bg-green-600 px-6 py-4 text-lg text-white hover:bg-green-700 md:flex md:w-full md:min-w-[150px] md:justify-center">*/}
                {/*  무료 체험 안내 <FaArrowRight className="ml-2" />*/}
                {/*</button>*/}

                {/* 무료 체험 신청 안내 */}
                <Link
                  href={"/purchase"}
                  className="hidden cursor-pointer items-center rounded-xl bg-green-600 px-6 py-4 text-lg text-white hover:bg-green-700 md:flex md:w-full md:min-w-[150px] md:justify-center">
                  무료 체험 신청 <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section - 명확하게 구분되도록 디자인 개선 */}
      <section className="bg-opacity-60 mt-12 w-full bg-gradient-to-br from-indigo-900 to-indigo-300 py-10 backdrop-blur-sm md:mt-16 md:py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-3xl font-semibold">프렌딩 공동체, 이렇게 다릅니다.</h2>
          <div className="mx-auto h-1 w-1/2 rounded-full bg-white"></div>

          {/* 모바일에서는 캐러셀로 표시 */}
          <div className="mt-6 sm:hidden">
            <div className="carousel relative w-full">
              {/* Feature 1 */}
              <div id="feature1" className="carousel-item relative w-full">
                <div className="mx-auto w-[90%] transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🏆</div>
                  <h3 className="text-xl font-semibold text-blue-600">목표와 보상</h3>
                  <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                    <li>100문장 공동 목표에 도전</li>
                    <li>개인/팀 학습 수치화로 동기 부여</li>
                    <li>공동 목표 달성 시 팀 구성원 전체에게 보상 제공</li>
                  </ul>
                </div>
                <div className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 transform justify-between">
                  <a
                    href="#feature3"
                    className="btn btn-circle btn-sm border-none bg-white/80"
                    onClick={() => {
                      changeSlide(2);
                      setTimeout(() => changeSlide(3), 500);
                    }}>
                    ❮
                  </a>
                  <a href="#feature2" className="btn btn-circle btn-sm border-none bg-white/80" onClick={() => changeSlide(2)}>
                    ❯
                  </a>
                </div>
              </div>

              {/* Feature 2 */}
              <div id="feature2" className="carousel-item relative w-full">
                <div className="mx-auto w-[90%] transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">📱</div>
                  <h3 className="text-xl font-semibold text-blue-600">성장형 학습 어플 + AI</h3>
                  <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                    <li>100문장 핵심 동영상 강의</li>
                    <li>원어민 음성 듣기 + 말하기 반복 훈련</li>
                    <li>AI를 활용한 스피킹 퀴즈로 실력 체크</li>
                  </ul>
                </div>
                <div className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 transform justify-between">
                  <a href="#feature1" className="btn btn-circle btn-sm border-none bg-white/80" onClick={() => changeSlide(1)}>
                    ❮
                  </a>
                  <a href="#feature3" className="btn btn-circle btn-sm border-none bg-white/80" onClick={() => changeSlide(3)}>
                    ❯
                  </a>
                </div>
              </div>

              {/* Feature 3 */}
              <div id="feature3" className="carousel-item relative w-full">
                <div className="mx-auto w-[90%] transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🌐</div>
                  <h3 className="text-xl font-semibold text-blue-600">온라인 공동 클래스</h3>
                  <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                    <li>zoom을 이용한 1:N 실시간 강의</li>
                    <li>문장 말하기 녹음 후 피드백 제공</li>
                    <li>팀원들이 함께 성장하는 온라인 스터디</li>
                  </ul>
                </div>
                <div className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 transform justify-between">
                  <a href="#feature2" className="btn btn-circle btn-sm border-none bg-white/80" onClick={() => changeSlide(2)}>
                    ❮
                  </a>
                  <a
                    href="#feature1"
                    className="btn btn-circle btn-sm border-none bg-white/80"
                    onClick={() => {
                      changeSlide(2);
                      setTimeout(() => changeSlide(1), 500);
                    }}>
                    ❯
                  </a>
                </div>
              </div>
            </div>

            {/* 캐러셀 인디케이터 - 동그라미 형태로 변경 */}
            <div className="mt-2 flex w-full justify-center gap-3 py-2">
              <a
                href="#feature1"
                onClick={() => changeSlide(1)}
                className={`h-3 w-3 rounded-full transition-all ${currentSlide === 1 ? "scale-125 bg-white" : "bg-indigo-300 hover:bg-indigo-200"}`}
              />
              <a
                href="#feature2"
                onClick={() => changeSlide(2)}
                className={`h-3 w-3 rounded-full transition-all ${currentSlide === 2 ? "scale-125 bg-white" : "bg-indigo-300 hover:bg-indigo-200"}`}
              />
              <a
                href="#feature3"
                onClick={() => changeSlide(3)}
                className={`h-3 w-3 rounded-full transition-all ${currentSlide === 3 ? "scale-125 bg-white" : "bg-indigo-300 hover:bg-indigo-200"}`}
              />
            </div>
          </div>

          {/* 태블릿/데스크탑에서는 그리드로 표시 */}
          <div className="hidden sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-6">
            {/* Feature 1 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🏆</div>
              <h3 className="text-xl font-semibold text-blue-600">목표와 보상</h3>
              <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                <li>100문장 공동 목표에 도전</li>
                <li>개인/팀 학습 수치화로 동기 부여</li>
                <li>공동 목표 달성 시 팀 구성원 전체에게 보상 제공</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">📱</div>
              <h3 className="text-xl font-semibold text-blue-600">성장형 학습 어플 + AI</h3>
              <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                <li>100문장 핵심 동영상 강의</li>
                <li>원어민 음성 듣기 + 말하기 반복 훈련</li>
                <li>AI를 활용한 스피킹 퀴즈로 실력 체크</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="transform rounded-xl bg-white/90 p-6 text-center shadow-lg transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🌐</div>
              <h3 className="text-xl font-semibold text-blue-600">온라인 공동 클래스</h3>
              <ul className="mt-2 list-outside list-disc pl-4 text-left text-gray-700">
                <li>zoom을 이용한 1:N 실시간 강의</li>
                <li>문장 말하기 녹음 후 피드백 제공</li>
                <li>팀원들이 함께 성장하는 온라인 스터디</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 무료 체험 모달 */}
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg md:p-8">
            {/*<h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">무료 체험 안내</h2>*/}
            {/*<div className="mx-auto mb-4 h-1 w-16 rounded-full bg-indigo-600"></div>*/}

            {/*<div className="text-gray-700">*/}
            {/*  <div className="mb-4 flex items-start">*/}
            {/*    <div className="mt-1 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">1</div>*/}
            {/*    <p>회원 가입 및 로그인 후 회원 정보에서 본인의 이름과 전화번호를 등록하세요.</p>*/}
            {/*  </div>*/}

            {/*  <div className="mb-6 flex items-start">*/}
            {/*    <div className="mt-1 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">2</div>*/}
            {/*    <p>이후, 내 강의 보기에 '무료 체험반'이 자동 생성됩니다.</p>*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/*<div className={"flex items-center justify-center"}>*/}
            {/*  <Link href="/users/edit" className={"mx-auto text-gray-500 underline"}>*/}
            {/*    회원 정보 등록*/}
            {/*  </Link>*/}
            {/*</div>*/}

            <div className={"text-gray-500"}>
              안녕하세요. 현재 웹싸이트 업데이트 진행 중으로 인해 일시적으로 무료 체험 이벤트 중단합니다. 양해 부탁드립니다.
            </div>

            <div className="mt-6 flex justify-center">
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
