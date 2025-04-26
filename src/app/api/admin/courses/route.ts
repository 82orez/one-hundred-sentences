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
          classDates: {
            orderBy: {
              date: "asc",
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
          classDates: {
            orderBy: {
              date: "asc",
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

    // classDates를 JSON 문자열에서 객체로 파싱
    const classDatesData = data.classDates ? JSON.parse(data.classDates) : [];

    // Course 생성
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
        duration: data.duration || "25분",
        endTime: data.endTime || null,
        classCount: data.classCount || 1,
      },
    });

    // ClassDate 레코드 생성
    if (classDatesData.length > 0) {
      await Promise.all(
        classDatesData.map((dateItem: any) =>
          prisma.classDate.create({
            data: {
              courseId: course.id,
              date: new Date(dateItem.date),
              dayOfWeek: dateItem.dayOfWeek,
            },
          }),
        ),
      );
    }

    // 생성된 Course와 ClassDates 함께 조회
    const courseWithDates = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        classDates: true,
      },
    });

    return NextResponse.json({ course: courseWithDates });
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
      include: { classDates: true },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "강좌를 찾을 수 없습니다." }, { status: 404 });
    }

    // classDates 파싱
    const classDatesData = data.classDates ? JSON.parse(data.classDates) : [];

    // 트랜잭션으로 업데이트 처리
    const result = await prisma.$transaction(async (prisma) => {
      // 기존 수업 날짜 모두 삭제
      await prisma.classDate.deleteMany({
        where: { courseId: id },
      });

      // 강좌 정보 업데이트
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
          duration: data.duration || existingCourse.duration,
          endTime: data.endTime || existingCourse.endTime,
          classCount: data.classCount || existingCourse.classCount,
        },
      });

      // 새 수업 날짜 추가
      if (classDatesData.length > 0) {
        await Promise.all(
          classDatesData.map((dateItem: any) =>
            prisma.classDate.create({
              data: {
                courseId: id,
                date: new Date(dateItem.date),
                dayOfWeek: dateItem.dayOfWeek,
              },
            }),
          ),
        );
      }

      return updatedCourse;
    });

    // 업데이트된 Course와 ClassDates 함께 조회
    const courseWithDates = await prisma.course.findUnique({
      where: { id },
      include: {
        classDates: {
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    return NextResponse.json({ course: courseWithDates });
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

    // 강좌 삭제 (ClassDate 모델은 cascade 설정으로 자동 삭제)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("강좌 삭제 오류:", error);
    return NextResponse.json({ error: "강좌 삭제에 실패했습니다." }, { status: 500 });
  }
}
