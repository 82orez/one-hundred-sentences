"use client";

// import { Button } from "@/components/ui/button";
import { useFreeEnrollment } from "@/hooks/useFreeEnrollment";
import { motion } from "framer-motion";
import Image from "next/image";

export default function EnglishCoursePage() {
  const { mutate: enrollCourse } = useFreeEnrollment();

  // const handleEnrollment = () => {
  //   enrollCourse({
  //     courseId: "cmce4nkls0001ftfvn4xwicj8",
  //     courseTitle: "대국민 여행영어 뽀개기 공동체반",
  //   });
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-[#FFE3B3] p-4 shadow-lg md:p-6">
        <div className="flex flex-col items-center justify-between text-2xl font-bold text-gray-700 md:gap-2 md:text-4xl">
          <div>대국민 여행영어 뽀개기</div>
          <div>공동체반!</div>
        </div>

        {/* 이미지 섹션 */}
        <div className="relative mt-2 w-full md:mt-4">
          <Image
            src="/images/tour-1.png"
            alt="대국민 여행영어 뽀개기 공동체반"
            width={1200}
            height={500}
            className="h-auto w-full rounded-t-2xl object-contain"
            priority
          />
        </div>

        {/* 텍스트 섹션 */}
        <div className="bg-[#FFF2D9] p-6">
          <h2 className="mb-2 text-2xl font-extrabold text-[#E94E1B] md:text-4xl">해외여행 필수 시대!</h2>
          <p className="mb-1 text-base text-[#4A2C20] md:text-xl">영어 소통에 불안감을 느끼는 사람,</p>
          <p className="mb-1 text-2xl font-bold text-[#E94E1B] md:text-4xl">무려 86%!</p>
          <p className="text-base text-[#4A2C20] md:text-xl">프렌딩은 그 불안을 함께 해결하고자 이 프로젝트를 기획했습니다.</p>
        </div>
      </div>

      {/* 헤더 섹션 */}
      <section className="hero bg-base-200 min-h-[50vh] text-center">
        <div className="hero-content flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-primary mb-4 text-5xl font-bold">대국민 여행영어 뽀개기 - 공동체반</h1>
            <p className="text-secondary mb-8 text-2xl font-semibold">완전무료! 함께 도전 참여하세요!!</p>
            <button className="btn btn-primary btn-lg">무료 수강 신청하기</button>
          </motion.div>
        </div>
      </section>

      {/* 프로그램 개요 */}
      <section className="container mx-auto px-4 py-16">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6 text-3xl">프로그램 개요</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <p>
                  <strong>강의명:</strong> 대국민 여행영어 뽀개기
                </p>
                <p>
                  <strong>강사:</strong> 션 쌤 (박민규)
                </p>
                <p>
                  <strong>기간:</strong> 20주 (주1회)
                </p>
                <p>
                  <strong>구성:</strong> 초급 여행영어 20유닛
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  <strong>교재:</strong> 온라인 교재 (오픈채팅방 제공)
                </p>
                <p>
                  <strong>수업 시간:</strong> 일 저녁 8시 (15분)
                </p>
                <p>
                  <strong>수업 기간:</strong> 25년 7월6일-11월17일
                </p>
                <p>
                  <strong>비용:</strong> <span className="text-primary font-bold">무료</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 프로그램 소개 */}
      <section className="container mx-auto px-4 py-16">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6 text-3xl">프로그램 소개</h2>
            <div className="prose max-w-none">
              <blockquote className="text-lg">
                해외여행 필수 시대!
                <br />
                영어 소통에 불안감을 느끼는 사람, 무려 86%!
                <br />
                프렌딩은 그 불안을 함께 해결하고자 이 프로젝트를 기획했습니다.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">프로그램 특징</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">공동체 기반 성취 시스템</h3>
              <p>팀 목표 + 개인 수치화로 지속적인 동기 부여</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">학습 어플 제공</h3>
              <p>동영상 강의, 원어민음성, 반복연습, 녹음까지 한 번에!!</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">1:N Zoom 클래스</h3>
              <p>실시간 소통으로 피드백과 몰입도 향상</p>
            </div>
          </div>
        </div>
      </section>

      {/* 유닛 구성 */}
      <section className="bg-base-200 container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">유닛 구성</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-hover">
              <div className="card-body">
                <h3 className="card-title text-sm">Unit {String(index + 1).padStart(2, "0")}</h3>
                <p>{getUnitTitle(index + 1)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-primary text-primary-content py-16 text-center">
        <h2 className="mb-8 text-3xl font-bold">지금 바로 시작하세요!</h2>
        <button className="btn btn-secondary ondary btn-lg">무료 수강 신청하기</button>
      </section>
    </div>
  );
}

function getUnitTitle(unit: number): string {
  const titles = [
    "비행기에서 승무원과 대화하기",
    "환승 공항에서 시내로 나가는 방법 묻기",
    "공항 보안 검색 대에서",
    "공항에서 택시 타고 호텔 가기",
    "마트에서 아시안 푸드 찾기",
    "커피숍에서 주문하기",
    "시내에서 길 묻기",
    "호텔 체크인하기",
    "호텔에서 물과 타올 요청하기",
    "호텔에서 조식 먹기",
    "쇼핑몰에서 옷 사기",
    "아이스크림 가게에서 주문하기",
    "기념품 추천 받기",
    "도서관에서 책 빌리기",
    "해변에서 사진 부탁하기",
    "박물관 투어에 대해 물어보기",
    "이탈리안 레스토랑에서 추천 받기",
    "산책길에서 강아지 주인과 얘기하기",
    "버스 카드 충전하기",
    "공항 셀프 체크인",
  ];
  return titles[unit - 1];
}
