import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <header className="bg-blue-600 py-12 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-extrabold">복습 웹앱으로 더 효율적으로 학습하세요</h1>
          <p className="mt-4 text-lg">이 웹앱은 당신의 학습 데이터를 추적하고 복습을 돕는 혁신적인 학습 도구입니다.</p>
          <Link href="/purchase">
            <button className="mt-6 rounded-lg bg-white px-6 py-3 font-bold text-blue-600 shadow-lg hover:bg-blue-100">지금 구매하기</button>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">주요 기능</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-blue-600">학습 진도 추적</h3>
              <p className="mt-2 text-sm text-gray-600">하루하루 학습 진도를 추적하여 너무 오래된 내용을 복습하는 데 도움을 줍니다.</p>
            </div>
            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-blue-600">사용자 맞춤</h3>
              <p className="mt-2 text-sm text-gray-600">개인별 학습 데이터를 기반으로 한 복습 추천 시스템.</p>
            </div>
            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-blue-600">모바일 최적화</h3>
              <p className="mt-2 text-sm text-gray-600">어디서나 복습 가능하도록 모바일에서 완벽히 작동합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
