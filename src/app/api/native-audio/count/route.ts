import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const courseId = url.searchParams.get("courseId");

  if (!userId) {
    return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "강좌 ID가 필요합니다" }, { status: 400 });
  }

  try {
    // 사용자의 선택된 강좌의 원어민 음성 듣기 시도 횟수 조회
    const attempts = await prisma.nativeAudioAttempt.findMany({
      where: {
        userId: userId,
        courseId: courseId, // 선택된 강좌 ID로 필터링
      },
      select: {
        attemptNativeAudio: true,
      },
    });

    // 모든 attemptNativeAudio 값의 합계 계산
    const totalAttempts = attempts.reduce((sum, record) => sum + (record.attemptNativeAudio || 0), 0);

    return NextResponse.json({ totalAttempts });
  } catch (error) {
    console.error("원어민 음성 듣기 횟수 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "원어민 음성 듣기 횟수 조회에 실패했습니다" }, { status: 500 });
  }
}
