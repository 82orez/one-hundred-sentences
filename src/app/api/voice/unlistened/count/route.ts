// app/api/voice/unlistened/count/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 검증
    if (!session?.user) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    // URL 에서 courseId 가져오기
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
    }

    // 공개된 전체 음성 파일 수 조회
    const totalVoiceFiles = await prisma.myVoiceOpenList.count({
      where: {
        courseId: courseId,
        userId: { not: session.user.id }, // 다른 사용자가 공개한 파일만
      },
    });

    // 현재 사용자가 들은 음성 파일 수 조회
    const listenedVoiceFiles = await prisma.voiceListened.count({
      where: {
        userId: session.user.id,
        myVoiceOpenList: {
          courseId: courseId,
          userId: { not: session.user.id }, // 다른 사용자가 공개한 파일만
        },
      },
    });

    // 아직 듣지 않은 파일 수 계산
    const unlistenedCount = totalVoiceFiles - listenedVoiceFiles;

    return NextResponse.json({ unlistenedCount });
  } catch (error) {
    console.error("Error counting unlistened voice files:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
