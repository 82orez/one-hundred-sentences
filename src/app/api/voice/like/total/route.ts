// app/api/voice/like/total/route.ts
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = session.user.id;

    if (!courseId) {
      return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
    }

    // 해당 사용자가 특정 강좌에 공개한 음성 파일들의 ID 목록 가져오기
    const myVoiceOpenList = await prisma.myVoiceOpenList.findMany({
      where: {
        userId: userId,
        courseId: courseId,
      },
      select: {
        id: true,
      },
    });

    // 음성 파일 ID 목록
    const voiceIds = myVoiceOpenList.map((voice) => voice.id);

    // 좋아요 총 개수 계산
    const totalLikes = await prisma.voiceLike.count({
      where: {
        myVoiceOpenListId: {
          in: voiceIds,
        },
      },
    });

    return NextResponse.json({ totalLikes });
  } catch (error) {
    console.error("좋아요 개수 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
