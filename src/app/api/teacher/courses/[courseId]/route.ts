// src/app/api/teacher/courses/[courseId]/route.tsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET 요청 처리: 특정 강좌 정보 조회
export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const courseId = params.courseId;

  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        teacherId: session.user.id, // 해당 강사의 강좌인지 확인
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "강좌를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("강좌 조회 실패:", error);
    return NextResponse.json({ error: "강좌 정보를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// PUT 요청 처리: 강좌 수정
export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const courseId = params.courseId;
  const { title, description } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "강좌명은 필수입니다." }, { status: 400 });
  }

  try {
    // 먼저 강좌가 해당 강사의 것인지 확인
    const courseExists = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!courseExists) {
      return NextResponse.json({ error: "강좌를 찾을 수 없거나 수정 권한이 없습니다." }, { status: 404 });
    }

    // 강좌 정보 업데이트
    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("강좌 수정 실패:", error);
    return NextResponse.json({ error: "강좌 정보 업데이트에 실패했습니다." }, { status: 500 });
  }
}

// DELETE 요청 처리: 강좌 삭제
export async function DELETE(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const courseId = params.courseId;

  try {
    // 먼저 강좌가 해당 강사의 것인지 확인
    const courseExists = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!courseExists) {
      return NextResponse.json({ error: "강좌를 찾을 수 없거나 삭제 권한이 없습니다." }, { status: 404 });
    }

    // 강좌 삭제 (관련 등록 정보도 함께 삭제될 수 있도록 설정 필요)
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({ message: "강좌가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("강좌 삭제 실패:", error);
    return NextResponse.json({ error: "강좌 삭제에 실패했습니다." }, { status: 500 });
  }
}
