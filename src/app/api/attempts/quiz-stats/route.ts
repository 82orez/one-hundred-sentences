import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const userId = url.searchParams.get("userId");

  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session || !session.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    // 사용자의 퀴즈 시도 횟수와 정답 수 합산 조회
    const quizStats = await prisma.quizAttempt.aggregate({
      _sum: {
        attemptQuiz: true, // 퀴즈 풀이 시도 횟수
        correctCount: true, // 정답 수
      },
      where: {
        userId: userId,
        courseId,
      },
    });

    return NextResponse.json({
      totalAttempts: quizStats._sum.attemptQuiz || 0,
      totalCorrect: quizStats._sum.correctCount || 0,
    });
  } catch (error) {
    console.error("퀴즈 통계 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "퀴즈 통계 조회에 실패했습니다",
        totalAttempts: 0,
        totalCorrect: 0,
      },
      { status: 500 },
    );
  }
}
