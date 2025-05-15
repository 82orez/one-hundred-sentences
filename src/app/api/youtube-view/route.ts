// app/api/youtube-view/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { sentenceNo, duration, courseId } = await req.json();

    // courseId 유효성 검사
    if (!courseId) {
      return NextResponse.json({ error: "courseId가 필요합니다" }, { status: 400 });
    }

    // ✅ 3초 이상 시청한 경우만 기록
    if (duration >= 3) {
      // ✅ duration 이 120초를 초과하면 120으로 제한
      const limitedDuration = duration >= 120 ? 120 : duration;

      const attempt = await prisma.youTubeViewAttempt.create({
        data: {
          courseId: courseId, // courseId 추가
          userId: session.user.id,
          sentenceNo: sentenceNo,
          duration: limitedDuration,
        },
      });

      return NextResponse.json(attempt);
    } else {
      return NextResponse.json({ message: "3초 미만 시청은 기록되지 않습니다" });
    }
  } catch (error) {
    console.error("유튜브 시청 기록 중 오류 발생:", error);
    return NextResponse.json({ error: "유튜브 시청 기록 실패" }, { status: 500 });
  }
}
