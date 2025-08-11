"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function PerthSpeakingTourLanding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const priceItems = useMemo(
    () => [
      { label: "계약금 및 입학금", value: "55만원" },
      { label: "학비/홈스테이/투어", value: "315만원 (약 3,442 AUD)" },
      { label: "총 비용", value: "370만원 (항공료 별도)" },
      { label: "할인 정책", value: "홈스테이 환불 $100 / 친구·가족 동반 $100 할인" },
    ],
    [],
  );

  const benefits = [
    "필리핀 1:1 화상영어 수업 12주 ",
    "온라인 여행영어 100문장 4주(1:N)",
    "월 1회 오프라인 모임(총 3회)",
    // "10년 경력 전문 강사 인솔",
    // "WA TVET 정부 지원 적용",
    // "시티·해변·동물원 등 액티비티",
  ];

  const schedule = [
    { time: "오전", weekday: "General English 수업", weekend: "자유/주말 투어" },
    { time: "오후", weekday: "Conversation Class 또는 현지 액티비티", weekend: "자유/주말 투어" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("연락처를 입력해주세요.");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("문의 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/perth-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "문의 접수 중 오류가 발생했습니다.");
      }

      toast.success("문의가 성공적으로 접수되었습니다! 담당자가 순차적으로 연락드리겠습니다.");

      // 폼 초기화
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("문의 접수 오류:", error);
      toast.error(error instanceof Error ? error.message : "문의 접수 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
      {/* NAV */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="text-2xl font-bold tracking-tight">
            서호주 스피킹 투어
          </a>
          <nav className="hidden gap-6 md:flex">
            <a href="#about" className="hover:underline">
              개요
            </a>
            <a href="#program" className="hover:underline">
              프로그램
            </a>
            <a href="#pricing" className="hover:underline">
              비용
            </a>
            <a href="#phoenix" className="hover:underline">
              Phoenix Academy
            </a>
            <a href="#benefits" className="hover:underline">
              혜택
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
          </nav>
          <a href="#contact" className="rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-zinc-900 hover:text-white">
            상담 신청
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 md:grid-cols-2 md:py-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl leading-tight font-extrabold md:text-5xl">
              실전 회화와 여행이 만나는
              <span className="mt-2 block text-emerald-600">서호주 스피킹 투어</span>
            </motion.h1>
            <p className="mt-4 max-w-prose text-zinc-700">
              서호주 퍼스(Perth) 스피킹 투어는 저희 프렌딩 아카데미(줌마영어)에서 이미 4회에 걸쳐 진행된 검증된 프로그램입니다.
            </p>
            <p className="mt-4 max-w-prose text-zinc-700">
              매년 1~2월 서호주 퍼스에서 자유 여행을 꿈꾸는 학생들을 위해 영어 연수와 현지 관광을 동시에 결합한 프로그램입니다.
            </p>
            <p className="mt-4 max-w-prose text-zinc-700">
              이번에는 2025년 1월 24일부터 다음 해 2월 9일까지 호주 퍼스(Perth)에서 16박 17일 일정으로 진행될 예정입니다.
            </p>
            <p className="mt-4 max-w-prose text-zinc-700">
              이 프로그램에 참여하시면 영어수업 · 홈스테이 · 액티비티가 결합된 체험형 스피킹 투어를 즐기시면서 자유여행을 위한 실전 영어를 익힐 수
              있습니다.
            </p>
            <p className="mt-4 max-w-prose text-zinc-700">
              특히 이번에는 호주 정부의 공식 지원으로 기존 대비 <span className={"font-semibold underline"}>30%가 할인된 금액</span>으로 프로그램에
              참여하실 수 있게 되었습니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 md:mx-auto">
                비용 보기
              </a>
              {/*<a href="#contact" className="rounded-2xl border px-5 py-3 text-sm font-semibold hover:bg-zinc-900 hover:text-white">*/}
              {/*  상담 신청*/}
              {/*</a>*/}
            </div>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm text-zinc-600">
              <li className="rounded-full border px-3 py-1">결합형(수업/투어) 영어 연수</li>
              <li className="rounded-full border px-3 py-1">호주 정부 공식 지원</li>
              <li className="rounded-full border px-3 py-1">대표 강사 인솔</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {["/images/perth/perth-1.png", "/images/perth/perth-2.png", "/images/perth/perth-3.png", "/images/perth/perth-4.png"].map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt="tour image"
                className={`h-40 w-full rounded-2xl object-cover shadow md:h-52 ${i % 3 === 0 ? "col-span-2" : ""}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">프로그램 개요</h2>
        <div className="mt-6 grid gap-6 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2">
          <dl className="grid grid-cols-2 gap-4 text-sm md:text-base">
            <div>
              <dt className="font-semibold">지역</dt>
              <dd className="text-zinc-700">호주 퍼스(Perth)</dd>
            </div>
            <div>
              <dt className="font-semibold">기간</dt>
              <dd className="text-zinc-700">2025.01.24 – 02.09 (16박 17일)</dd>
            </div>
            <div>
              <dt className="font-semibold">대상</dt>
              <dd className="text-zinc-700">일반인 · 학생(친구/가족 동반 가능)</dd>
            </div>
            <div>
              <dt className="font-semibold">운영</dt>
              <dd className="text-zinc-700">㈜프렌딩 + 서호주 Phoenix Academy</dd>
            </div>
          </dl>
          <p className="text-zinc-700">
            홈스테이 기반 생활 밀착형 환경에서 오전에는 영어 수업을 하고, 오후에는 여러가지 액티비티를 통해 실전 스피킹에 도전합니다.
          </p>
        </div>
      </section>

      {/* PROGRAM */}
      <section id="program" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">일과 및 커리큘럼</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm md:text-base">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3">구분</th>
                <th className="px-4 py-3 text-center">월 ~ 금</th>
                <th className="px-4 py-3 text-center">토/일</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.time} className="border-t">
                  <td className="px-4 py-3 font-semibold">{row.time}</td>
                  <td className="px-4 py-3 text-zinc-700">{row.weekday}</td>
                  <td className="px-4 py-3 text-zinc-700">{row.weekend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "시티 투어 및 랜드마크 탐방",
            "코알라·캥거루 체험, 버섯농장/공원 방문",
            "해변 액티비티 및 자유시간",
            "현지 생활 적응을 위한 홈스테이",
          ].map((t, i) => (
            <li key={i} className="rounded-xl border bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">비용 안내</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <ul className="space-y-3 text-sm md:text-base">
              {priceItems.map((it) => (
                <li key={it.label} className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <span className="font-semibold">{it.label}</span>
                  <span className="text-zinc-700">{it.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-zinc-500">* 환율/현지 사정에 따라 변동 가능.</p>
          </div>
          <div className="rounded-2xl border bg-emerald-600/5 p-6 shadow-sm">
            <h3 className="text-lg font-semibold">할인 정책</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700 md:text-base">
              <li>홈스테이 환불: $100</li>
              <li>친구·가족 동반: $100 할인/인</li>
              <li>호주 정부 지원 : WA TVET 프로그램 적용가 </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PHOENIX ACADEMY */}
      <section id="phoenix" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">
          <a
            href="https://www.phoenix.edu.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer transition-colors hover:text-emerald-600">
            Phoenix Academy 소개
          </a>
        </h2>
        <div className="mt-6 grid items-center gap-6 md:grid-cols-2 md:gap-0">
          <img
            src="/images/perth/perth-5.png"
            alt="Phoenix Academy campus"
            className="h-full w-full rounded-2xl object-cover shadow md:mx-auto md:h-full md:max-w-sm"
          />
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <dl className="grid grid-cols-2 gap-3 text-sm md:text-base">
              <div>
                <dt className="font-semibold">설립</dt>
                <dd className="text-zinc-700">1989년</dd>
              </div>
              <div>
                <dt className="font-semibold">위치</dt>
                <dd className="text-zinc-700">퍼스 시내 15분, 해변 인근</dd>
              </div>
              <div>
                <dt className="font-semibold">캠퍼스</dt>
                <dd className="text-zinc-700">부지 1.5ha, 최대 130명 수용</dd>
              </div>
              <div>
                <dt className="font-semibold">학생 구성</dt>
                <dd className="text-zinc-700">30개국+, 누적 5만명 졸업</dd>
              </div>
            </dl>
            <p className="mt-4 text-zinc-700">
              국제적 학습 환경과 다양한 강의·기숙 시설을 갖춘 퍼스 대표 어학기관으로, 실전 회화 향상에 최적화된 커리큘럼을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">제공되는 무료 혜택</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 text-sm text-zinc-700 shadow-sm">
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">자주 묻는 질문 (FAQ)</h2>
        <div className="mt-6 space-y-4">
          <details className="rounded-2xl border bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold">항공권이 포함되어 있나요?</summary>
            <p className="mt-2 text-sm text-zinc-700">
              아니요. 항공료는 별도입니다. 항공권은 프로그램 일정(1/24–2/9)에 맞춰서 개별적으로 구입하시면 됩니다. 다만, 원하시는 경우에는 대신 구입해
              드릴 수 있어요.
            </p>
          </details>
          <details className="rounded-2xl border bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold">영어 실력이 많이 부족해도 참여 가능할까요?</summary>
            <p className="mt-2 text-sm text-zinc-700">
              가능합니다. 출발 전 제공되는 무료 화상수업과 온라인 과정으로 기초를 다지고, 현지에서는 수준별 수업이 제공됩니다.
            </p>
          </details>
          <details className="rounded-2xl border bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold">혼자 참여해도 안전한가요?</summary>
            <p className="mt-2 text-sm text-zinc-700">
              프렌딩 아카데미 대표 강사가 직접 인솔 및 홈스테이 배정으로 걱정없이 안전하게 프로그램에 참여하실 수 있습니다.
            </p>
          </details>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold md:text-3xl">상담 및 문의하기</h2>
          <p className="mt-4 text-zinc-700">상담 내용을 남겨주시면 담당자가 확인 후 남겨주신 연락처로 순차적으로 연락드립니다.</p>
          <p className="mt-2 text-zinc-700">또는 다음 연락처로 연락 부탁드립니다.</p>
          <p className="mt-2 font-semibold text-zinc-700">(주)프렌딩 대표 박민규 010-3753-4546</p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="이름"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="연락처"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
              placeholder="이메일 (선택)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <textarea
              className="h-28 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
              placeholder="문의 내용"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-2xl px-5 py-3 text-lg font-semibold text-white md:w-auto ${
                isSubmitting ? "cursor-not-allowed bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}>
              {isSubmitting ? "보내는 중..." : "보내기"}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-zinc-500">© {new Date().getFullYear()} Friending / Phoenix Academy</footer>

      {/* Sticky CTA */}
      <a
        href="#contact"
        className="fixed right-6 bottom-6 rounded-lg bg-indigo-600 px-5 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-700">
        상담 신청
      </a>
    </main>
  );
}
