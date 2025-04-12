// src/app/api/teacher/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 강좌 목록 조회 API
export async function GET() {
  try {
    // 현재 로그인한 사용자 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 현재 사용자가 강사인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!(user?.role === "teacher" || user?.role === "admin")) {
      return NextResponse.json({ error: "강사 권한이 없습니다." }, { status: 403 });
    }

    // 강사의 강좌 목록 조회
    const courses = await prisma.course.findMany({
      where: {
        generatorId: session.user.id,
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("강좌 목록 조회 오류:", error);
    return NextResponse.json({ error: "강좌 목록을 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 새 강좌 생성 API
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 현재 사용자가 강사인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!(user?.role === "teacher" || user?.role === "admin")) {
      return NextResponse.json({ error: "강사 권한이 없습니다." }, { status: 403 });
    }

    // 요청 본문에서 데이터 추출
    const { title, description } = await request.json();

    // 필수 필드 유효성 검사
    if (!title) {
      return NextResponse.json({ error: "강좌명은 필수 항목입니다." }, { status: 400 });
    }

    // 새 강좌 생성
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        generatorId: session.user.id,
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("강좌 생성 오류:", error);
    return NextResponse.json({ error: "강좌를 생성하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
