// app/api/voice/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const sinceParam = searchParams.get("since");

    if (!courseId) {
      return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
    }

    // 쿼리 조건 설정
    let whereCondition: any = {
      courseId: courseId,
    };

    // 마지막 확인 시간 이후의 음성 파일만 필터링
    if (sinceParam) {
      const since = new Date(sinceParam);
      whereCondition.createdAt = {
        gt: since,
      };
    }

    // 현재 사용자의 ID는 제외 (자신의 업로드는 제외)
    whereCondition.userId = {
      not: session.user.id,
    };

    // 새로운 음성 파일 수 조회
    const count = await prisma.myVoiceOpenList.count({
      where: whereCondition,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("새 음성 파일 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
