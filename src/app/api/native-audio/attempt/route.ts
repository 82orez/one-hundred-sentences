// src/app/api/native-audio/attempt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 세션 정보 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다" }, { status: 401 });
    }

    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    // 요청 본문에서 문장 번호와 강좌 ID 추출
    const { sentenceNo, courseId } = await req.json();

    if (!sentenceNo) {
      return NextResponse.json({ error: "문장 번호가 필요합니다" }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다" }, { status: 400 });
    }

    // 이미 해당 사용자와 문장에 대한 기록이 있는지 확인
    const existingAttempt = await prisma.nativeAudioAttempt.findFirst({
      where: {
        userId: user.id,
        sentenceNo: parseInt(sentenceNo, 10),
        courseId: courseId,
      },
    });

    let updatedAttempt;

    if (existingAttempt) {
      // 기존 기록 업데이트
      updatedAttempt = await prisma.nativeAudioAttempt.update({
        where: { id: existingAttempt.id },
        data: { attemptNativeAudio: existingAttempt.attemptNativeAudio + 1 },
      });
    } else {
      // 새 기록 생성
      updatedAttempt = await prisma.nativeAudioAttempt.create({
        data: {
          userId: user.id,
          sentenceNo: parseInt(sentenceNo, 10),
          courseId: courseId,
          attemptNativeAudio: 1,
        },
      });
    }

    return NextResponse.json({
      message: existingAttempt ? "네이티브 오디오 듣기 기록이 업데이트 되었습니다" : "새 네이티브 오디오 듣기 기록이 생성되었습니다",
      count: updatedAttempt.attemptNativeAudio,
    });
  } catch (error) {
    console.error("네이티브 오디오 듣기 기록 중 오류:", error);
    return NextResponse.json({ error: "네이티브 오디오 듣기 기록에 실패했습니다" }, { status: 500 });
  }
}
