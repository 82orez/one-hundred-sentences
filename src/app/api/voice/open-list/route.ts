// app/api/voice/open-list/route.ts
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

    // 공개된 음성 파일 목록 가져오기
    const voiceList = await prisma.myVoiceOpenList.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: {
          select: {
            name: true,
            classNickName: true,
            image: true,
            customImageUrl: true,
            isImagePublicOpen: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 생성일 기준 내림차순 정렬 (최신순)
        // sentenceNo: "asc",
      },
    });

    // 사용자 이미지 비공개 처리
    const filteredVoiceList = voiceList.map((item) => ({
      ...item,
      user: {
        ...item.user,
        image: item.user.isImagePublicOpen ? item.user.image : null,
        customImageUrl: item.user.isImagePublicOpen ? item.user.customImageUrl : null,
      },
    }));

    return NextResponse.json(filteredVoiceList);
  } catch (error) {
    console.error("Error fetching voice list:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
