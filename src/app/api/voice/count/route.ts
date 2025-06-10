// app/api/voice/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 인증 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URL 에서 courseId 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // 해당 강좌에 등록된 모든 공개 음성 파일 수 조회
    const totalFiles = await prisma.myVoiceOpenList.count({
      where: {
        courseId: courseId,
      },
    });

    return NextResponse.json({
      totalFiles,
    });
  } catch (error) {
    console.error("음성 파일 수 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "Failed to get voice files count" }, { status: 500 });
  }
}
