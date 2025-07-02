"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaHandPointRight } from "react-icons/fa";

export default function EnglishCoursePage() {
  const router = useRouter();

  const handleEnrollment = () => {
    if (confirm("무료 수업 참여 신청 페이지로 이동하시겠습니까?")) {
      router.replace("/purchase/free");
    }
  };

  return (
    <div className="min-h-screen md:py-8">
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
          <div className={"text-center"}>
            <h2 className="mb-2 text-2xl font-bold text-[#E94E1B] md:text-4xl">해외여행 필수 시대!</h2>
            <p className="mb-1 text-base text-[#4A2C20] md:text-xl">영어 소통에 불안감을 느끼는 사람,</p>
            <p className="mb-1 text-2xl font-bold text-[#E94E1B] md:text-4xl">무려 86%!</p>
          </div>
          <p className="mt-6 text-base text-[#4A2C20] md:text-xl">프렌딩은 그 불안감을 함께 해결하고자 이 프로젝트를 기획했습니다.</p>
          <p className="mt-2 text-base text-[#4A2C20] md:text-xl">
            이 프로젝트는 팀원들이 공동체를 이루어 함께 끝까지 완주하는 대국민 <span className={"font-semibold underline"}>완전 무료</span> 영어 학습
            프로그램입니다.
          </p>
        </div>
      </div>

      {/* 헤더 섹션 */}
      <section className="mt-6 text-center">
        <div className="flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/*<h1 className="text-primary mb-4 text-5xl font-bold">대국민 여행영어 뽀개기 - 공동체반</h1>*/}
            <p className="text-secondary mb-4 text-2xl font-semibold md:mb-4">완전무료! 함께 도전 참여하세요!!</p>
            <button className="btn btn-primary btn-lg" onClick={handleEnrollment}>
              무료 수업 참여 신청
            </button>
          </motion.div>
        </div>
      </section>

      {/* 프로그램 개요 */}
      <section className="container mx-auto w-full max-w-lg px-4 py-8 md:px-12 md:py-16">
        <div className="card border shadow-xl md:p-2">
          <div className="card-body">
            <h2 className="card-title mx-auto text-2xl font-bold md:mb-2 md:text-3xl">프로그램 개요</h2>
            <div className="mt-4 grid gap-6 text-lg md:grid-cols-1">
              <ul className="space-y-4 px-4">
                <li className={"list-disc"}>
                  <strong>강의명 :</strong> 대국민 여행영어 뽀개기 공동체반
                </li>
                <li className={"list-disc"}>
                  <strong>강사 :</strong> 박민규 대표 강사 (Sean)
                </li>

                <li className={"list-disc"}>
                  <strong>교재 :</strong> ShallE 100 여행영어
                </li>

                <li className={"list-disc"}>
                  <strong>수업 일시 :</strong> 매주 일요일 오후 8시
                </li>

                <li className={"list-disc"}>
                  <strong>수업 시간 :</strong> 15분 (총 20회)
                </li>

                <li className={"list-disc"}>
                  <strong>수업 기간 :</strong> 7월 6일 ~ 11월 23일
                </li>

                <li className={"list-disc"}>
                  <strong> 수강료 :</strong> <span className="text-primary font-bold">무료</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section className="container mx-auto w-full max-w-6xl px-4 py-4 md:py-16">
        <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">프로그램 특징</h2>
        <div className={"border border-b"}></div>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="card border shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <FaHandPointRight />
                <div className={"text-xl"}>공동체 기반 성취 시스템</div>
              </h3>
              <div className={"text-[1rem]"}>팀 목표 + 개인 수치화로 지속적인 동기 부여</div>
              <Image src={"/images/teampoints.png"} width={500} height={500} alt={"team screen"} className={"rounded-2xl"} />
              <Image src={"/images/members.png"} width={500} height={500} alt={"team screen"} className={"rounded-2xl"} />
            </div>
          </div>
          <div className="card border shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <FaHandPointRight />
                <div className={"text-xl"}>학습 어플 제공</div>
              </h3>
              <div className={"text-[1rem]"}>동영상 강의, 원어민음성, 반복연습, 녹음까지 한 번에!!</div>
              <Image src={"/images/learn-page.png"} width={500} height={500} alt={"team screen"} className={"rounded-2xl"} />
            </div>
          </div>
          <div className="card border shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <FaHandPointRight />
                <div className={"text-xl"}>1:N Zoom 클래스</div>
              </h3>
              <div className={"text-[1rem]"}>실시간 온라인 수업으로 소통과 몰입도 향상</div>
              <Image src={"/images/zoom_screen.png"} width={500} height={500} alt={"zoom screen"} className={"mt-2 rounded-2xl"} />
            </div>
          </div>
        </div>

        <div className={"mt-8 border border-b"}></div>
      </section>

      {/* 유닛 구성 */}
      <section className="bg-base-200 container mx-auto mt-4 w-full max-w-11/12 rounded-2xl border px-4 py-8 md:mt-0 md:max-w-6xl md:py-12">
        <h2 className="text-center text-3xl font-bold md:mb-4">유닛 구성</h2>
        <p className={"mt-3 text-center"}>
          실제 여행에 필요한 상황을 바탕으로 문장 구성, 쓸모있는 표현들만 배웁니다. 입국심사, 공항, 쇼핑, 현지인들과 대화 등을 알차게 배워요.
        </p>
        <div className="mt-2 grid gap-4 md:mt-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-hover">
              <div className="card-body text-lg">
                <h3 className="card-title text-lg">Unit {String(index + 1).padStart(2, "0")}</h3>
                <p>{getUnitTitle(index + 1)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-primary text-primary-content mt-8 py-6 text-center md:py-12">
        <h2 className="mb-4 text-3xl font-bold md:mb-6">지금 바로 시작하세요!</h2>
        <button className="btn btn-secondary ondary btn-lg" onClick={handleEnrollment}>
          무료 수업 참여 신청
        </button>
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
