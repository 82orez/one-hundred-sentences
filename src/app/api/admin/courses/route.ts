import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // URL 파라미터에서 id 확인
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // id가 있으면 특정 강좌 조회, 없으면 모든 강좌 조회
    if (id) {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          teacher: {
            select: {
              id: true,
              realName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: "강좌를 찾을 수 없습니다." }, { status: 404 });
      }

      return NextResponse.json({ course });
    } else {
      // 모든 강좌 조회 (기존 로직 유지)
      const courses = await prisma.course.findMany({
        include: {
          teacher: {
            select: {
              id: true,
              realName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ courses });
    }
  } catch (error) {
    console.error("강좌 조회 오류:", error);
    return NextResponse.json({ error: "강좌 조회에 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await request.json();

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        generatorId: session.user.id,
        teacherId: data.teacherId,
        scheduleMonday: data.scheduleMonday,
        scheduleTuesday: data.scheduleTuesday,
        scheduleWednesday: data.scheduleWednesday,
        scheduleThursday: data.scheduleThursday,
        scheduleFriday: data.scheduleFriday,
        scheduleSaturday: data.scheduleSaturday,
        scheduleSunday: data.scheduleSunday,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime || null,
        duration: data.duration || "25분", // 수업 진행 시간 추가
        endTime: data.endTime || null, // 수업 종료 시간 추가
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("강좌 생성 오류:", error);
    return NextResponse.json({ error: "강좌 생성에 실패했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID가 제공되지 않았습니다." }, { status: 400 });
    }

    const data = await request.json();

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "강좌를 찾을 수 없습니다." }, { status: 404 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        teacherId: data.teacherId,
        scheduleMonday: data.scheduleMonday,
        scheduleTuesday: data.scheduleTuesday,
        scheduleWednesday: data.scheduleWednesday,
        scheduleThursday: data.scheduleThursday,
        scheduleFriday: data.scheduleFriday,
        scheduleSaturday: data.scheduleSaturday,
        scheduleSunday: data.scheduleSunday,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime || null,
        duration: data.duration || existingCourse.duration, // 기존 값 유지 또는 새 값 적용
        endTime: data.endTime || existingCourse.endTime, // 기존 값 유지 또는 새 값 적용
      },
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error("강좌 수정 오류:", error);
    return NextResponse.json({ error: "강좌 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // URL 파라미터에서 id 가져오기
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID가 제공되지 않았습니다." }, { status: 400 });
    }

    // 강좌 존재 여부 확인
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "강좌를 찾을 수 없습니다." }, { status: 404 });
    }

    // 강좌 삭제 (관련 등록 정보, 수업 등은 cascade 설정에 따라 자동 삭제됨)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("강좌 삭제 오류:", error);
    return NextResponse.json({ error: "강좌 삭제에 실패했습니다." }, { status: 500 });
  }
}
