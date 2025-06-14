// /api/voice/my-open-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URL 에서 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 사용자가 해당 강좌에 공개한 음성 파일 수 조회
    const count = await prisma.myVoiceOpenList.count({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching my voice open count:", error);
    return NextResponse.json({ error: "Failed to fetch my voice open count" }, { status: 500 });
  }
}
