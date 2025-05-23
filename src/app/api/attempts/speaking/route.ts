// app/api/attempts/speaking/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { sentenceNo, isCorrect, courseId } = await request.json();
    if (!sentenceNo) {
      return NextResponse.json({ error: "문장 번호가 필요합니다" }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다" }, { status: 400 });
    }

    // 기존 시도 기록 조회
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: session.user.id,
        sentenceNo: sentenceNo,
        courseId: courseId,
        kind: "speaking",
      },
    });

    // 기존 기록이 있으면 업데이트, 없으면 새로 생성
    if (existingAttempt) {
      const updateData: any = {
        attemptQuiz: (existingAttempt.attemptQuiz || 0) + 1,
      };

      // 정답이면 correct 필드도 증가
      if (isCorrect) {
        updateData.correctCount = (existingAttempt.correctCount || 0) + 1;
      }

      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: existingAttempt.id },
        data: updateData,
      });

      return NextResponse.json(updatedAttempt);
    } else {
      const newAttempt = await prisma.quizAttempt.create({
        data: {
          userId: session.user.id,
          sentenceNo: sentenceNo,
          courseId: courseId,
          kind: "speaking",
          attemptQuiz: 1,
          correctCount: isCorrect ? 1 : 0,
        },
      });
      return NextResponse.json(newAttempt);
    }
  } catch (error) {
    console.error("말하기 시도 기록 오류:", error);
    return NextResponse.json({ error: "말하기 시도 기록에 실패했습니다" }, { status: 500 });
  }
}
