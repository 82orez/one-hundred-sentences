// src/app/api/course-points/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// 사용자의 특정 코스 포인트 조회
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId가 필요합니다" }, { status: 400 });
  }

  try {
    const coursePoints = await prisma.userCoursePoints.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    // 포인트 정보가 없으면 0 반환
    if (!coursePoints) {
      return NextResponse.json({ points: 0 });
    }

    return NextResponse.json(coursePoints);
  } catch (error) {
    console.error("포인트 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

// 사용자의 특정 코스 포인트 업데이트
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { courseId, points } = await req.json();

    if (!courseId || typeof points !== "number") {
      return NextResponse.json({ error: "courseId와 points가 필요합니다" }, { status: 400 });
    }

    // 포인트 업데이트 또는 생성 (upsert)
    const coursePoints = await prisma.userCoursePoints.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      update: {
        points: points,
      },
      create: {
        userId: session.user.id,
        courseId: courseId,
        points: points,
      },
    });

    return NextResponse.json(coursePoints);
  } catch (error) {
    console.error("포인트 업데이트 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 업데이트 실패" }, { status: 500 });
  }
}
