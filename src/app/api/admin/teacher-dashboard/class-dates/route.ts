import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // 세션 확인 (로그인 상태 확인)
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 로그인한 사용자가 강사인지 확인
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
      include: {
        Teachers: true,
      },
    });

    if (!currentUser || !currentUser.Teachers) {
      return new NextResponse("접근 권한이 없습니다.", { status: 403 });
    }

    const teacherId = currentUser.Teachers.id;

    // 강사의 수업 목록 가져오기
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherId,
      },
      select: {
        id: true,
      },
    });

    const courseIds = courses.map((course) => course.id);

    // 해당 강사의 수업에 등록된 수업 일정 가져오기
    const classDates = await prisma.classDate.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        courseId: true,
        date: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // 날짜 형식을 ISO 문자열로 변환하여 반환
    const formattedClassDates = classDates.map((classDate) => ({
      ...classDate,
      date: classDate.date.toISOString(),
    }));

    return NextResponse.json(formattedClassDates);
  } catch (error) {
    console.error("[CLASS_DATES_API_ERROR]", error);
    return new NextResponse("내부 서버 오류", { status: 500 });
  }
}
