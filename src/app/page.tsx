"use server";

import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-400 px-2 text-white md:px-6">
      <header className="mb-10 text-center">
        <h1 className="mb-8 text-4xl font-bold drop-shadow-lg md:text-5xl">한 달만에 끝내는 “여행영어 100문장 사관학교”</h1>
        <p className="mx-auto mb-2 max-w-2xl text-lg text-gray-200 md:text-xl">효과적인 영어 학습을 위한 최고의 플랫폼!</p>
        <p className="mx-auto max-w-2xl text-lg text-gray-200 md:text-xl">100문장을 암기하고 영어 실력을 향상하세요.</p>
      </header>

      <Card className="flex w-full max-w-4xl flex-col items-center rounded-2xl bg-white p-6 text-gray-800 shadow-xl md:flex-row">
        <Image src="/images/english-learning.png" width={300} height={300} alt="영어 학습" className="mb-4 rounded-lg shadow-md md:mr-6 md:mb-0" />
        <CardContent className="text-center md:text-left">
          <h2 className="mb-3 text-2xl font-semibold">영어 100문장으로 영어의 기초를 완성하세요</h2>
          <p className="mb-4 text-gray-600">반복 학습과 체계적인 암기법을 통해 누구나 쉽게 영어 실력을 높일 수 있습니다.</p>
          <Button className="flex cursor-pointer items-center rounded-full bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700">
            학습 시작하기 <FaArrowRight className="ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
