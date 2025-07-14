// app/(marketing)/page.tsx
import Image from "next/image";

export default function TravelEnglishPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-0 px-4 py-6 text-center md:flex-row md:gap-6 md:py-12">
        <div className="md:w-1/2">
          <h1 className="text-3xl font-extrabold sm:text-5xl">프렌딩 여행영어</h1>
          <h1 className="mt-2 text-3xl font-extrabold whitespace-nowrap sm:text-5xl md:mt-4">1:1 화상영어</h1>
          <div className={"md:hidden"}>
            <p className="mt-4 text-lg leading-relaxed">실전 말하기 훈련으로</p>
            <p className="font-semibold text-sky-600">빠른 실력 업그레이드!</p>
          </div>
          <p className={"mt-4 hidden text-lg leading-relaxed md:block"}>
            실전 말하기 훈련으로 <span className="font-semibold text-sky-600">빠른 실력 업그레이드!</span>
          </p>
          <a
            href="tel:01037534546"
            className="mt-4 inline-block rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-sky-700 md:mt-8">
            상담 예약하기
          </a>
        </div>

        {/* 대표 이미지 자리 */}
        <div className="relative mt-6 h-96 w-full overflow-hidden rounded-3xl shadow-lg md:mt-0 md:w-1/2">
          <Image src="/images/one_to_one_online_class.png" alt="온라인 수업 화면" fill className="object-cover" priority />
        </div>
      </section>

      {/* Overview */}
      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 sm:grid-cols-2">
          {[
            ["강의명", "프렌딩 여행영어 1:1 화상영어"],
            ["강사", "필리핀 원어민 강사"],
            ["교재", "프렌딩 여행영어 100 (온라인)"],
            ["수업 시간", "주 2회 · 회당 25분"],
            ["수강료", "180,000원 (12주, 총 24회)"],
            ["대상", "초급‒초중급 / 여행 준비자"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <span className="text-base font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-2xl font-extrabold sm:text-3xl">프로그램 특징</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ["/feature1.jpg", "학습어플 연계 + 실전 연습", "반복 학습과 말하기 훈련을 통해 표현력·응용력·적응력이 동시에 향상!"],
            ["/feature2.jpg", "1:1 전담 강사제", "내 수준에 딱 맞춘 수업으로 영어 자신감 UP! 실력도 자연스럽게 성장"],
            ["/feature3.jpg", "실시간 피드백 + 표현 교정", "직접 말한 문장을 바로 교정받고, 발음·문법·표현까지 정확하게 완성!"],
          ].map(([src, title, desc]) => (
            <article key={title} className="flex flex-col items-center text-center">
              <div className="relative mb-6 h-52 w-full overflow-hidden rounded-2xl shadow-lg">
                <Image src={src} alt={title} fill className="object-cover" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Units */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-extrabold sm:text-3xl">유닛 구성</h2>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              "비행기에서 승무원과 대화하기",
              "환승 공항에서 시내로 나가는 방법 묻기",
              "공항 보안 검색대에서",
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
            ].map((unit, i) => (
              <li key={unit} className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm transition hover:shadow-md">
                <span className="font-semibold">Unit {String(i + 1).padStart(2, "0")}</span>
                &nbsp;— {unit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">빠르게 실력을 올리고 싶다면?</h2>
        <p className="max-w-lg text-base">1:1 전담 강사와 시작해 보세요. 상담만 받아도 학습 가이드를 드립니다!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:01037534546" className="rounded-xl bg-sky-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-sky-700">
            010-3753-4546 전화하기
          </a>
          <a
            href="https://pf.kakao.com/_YOUR_ID_"
            className="rounded-xl border border-sky-600 px-8 py-3 font-semibold text-sky-600 shadow-md transition hover:bg-sky-50">
            카카오톡 문의
          </a>
        </div>
      </section>
    </main>
  );
}
