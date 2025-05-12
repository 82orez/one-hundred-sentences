// src/app/api/my-courses/teacher/route.ts
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증되지 않았습니다." }, { status: 401 });
    }

    // 강사 ID 가져오기
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        Teachers: true,
      },
    });

    if (!user?.Teachers) {
      return NextResponse.json({ error: "강사 계정이 아닙니다." }, { status: 403 });
    }

    // 강사의 강좌 목록 가져오기
    const courses = await prisma.course.findMany({
      where: {
        teacherId: user.Teachers.id,
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        teacherId: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("강사 강좌 조회 오류:", error);
    return NextResponse.json({ error: "강좌 정보를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
