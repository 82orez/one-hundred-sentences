// /app/api/voice/like/user-likes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // URL 쿼리 파라미터 가져오기
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const courseId = url.searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // 특정 사용자가 특정 강좌에서 다른 사용자의 음성 파일에 좋아요를 누른 횟수 집계
    const totalUserLikes = await prisma.voiceLike.count({
      where: {
        userId: userId,
        myVoiceOpenList: {
          courseId: courseId
        }
      }
    });

    return NextResponse.json({ totalUserLikes });
  } catch (error) {
    console.error("좋아요 정보 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "좋아요 정보 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}