// /api/youtube-view/total/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const courseId = url.searchParams.get("courseId");

  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session || !session.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    // 사용자의 모든 YouTube 시청 시간 합산 조회
    const totalDuration = await prisma.youTubeViewAttempt.aggregate({
      _sum: {
        duration: true,
      },
      where: {
        userId: userId,
        courseId: courseId, // courseId 조건 추가
      },
    });

    return NextResponse.json({
      totalDuration: totalDuration._sum.duration || 0,
    });
  } catch (error) {
    console.error("YouTube 시청 시간 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "YouTube 시청 시간 조회에 실패했습니다",
        totalDuration: 0,
      },
      { status: 500 },
    );
  }
}
