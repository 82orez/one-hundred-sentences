// api/course-points/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
  }

  try {
    // 포인트 정보와 함께 사용자 정보를 조인해서 가져옴
    const points = await prisma.userCoursePoints.findMany({
      where: {
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            classNickName: true,
            image: true,
            customImageUrl: true,
          },
        },
      },
      orderBy: {
        points: "desc",
      },
    });

    return NextResponse.json(points);
  } catch (error) {
    console.error("포인트 정보를 가져오는 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 정보를 가져오는데 실패했습니다." }, { status: 500 });
  }
}
