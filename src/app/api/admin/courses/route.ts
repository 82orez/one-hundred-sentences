import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 강좌 상태 계산 함수 추가
function calculateCourseStatus(startDate: Date | null, endDate: Date | null): "대기 중" | "진행 중" | "완료" {
  const today = new Date();

  if (!startDate || !endDate) return "대기 중"; // 날짜 정보가 없으면 기본적으로 대기 중

  // 시작일과 종료일의 시간을 00:00:00으로 설정하여 날짜만 비교
  const normalizedToday = new Date(today.setHours(0, 0, 0, 0));
  const normalizedStartDate = new Date(startDate.setHours(0, 0, 0, 0));
  const normalizedEndDate = new Date(endDate.setHours(0, 0, 0, 0));

  if (normalizedToday < normalizedStartDate) {
    return "대기 중"; // 오늘이 시작일 전이면 대기 중
  } else if (normalizedToday > normalizedEndDate) {
    return "완료"; // 오늘이 종료일 후면 완료
  } else {
    return "진행 중"; // 그 외의 경우는 진행 중
  }
}

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
              userId: true,
              isActive: true,
              user: {
                select: {
                  realName: true, // User 모델을 통해 realName에 접근
                  email: true,
                  phone: true,
                },
              },
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

      // 강좌 상태 계산
      const courseStatus = calculateCourseStatus(course.startDate, course.endDate);

      return NextResponse.json({
        course: {
          ...course,
          status: courseStatus,
        },
      });
    } else {
      // 모든 강좌 조회
      const courses = await prisma.course.findMany({
        include: {
          teacher: {
            select: {
              id: true,
              userId: true,
              isActive: true,
              user: {
                select: {
                  realName: true, // User 모델을 통해 realName에 접근
                  email: true,
                  phone: true,
                },
              },
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

      // 각 강좌에 상태 추가
      const coursesWithStatus = courses.map((course) => ({
        ...course,
        status: calculateCourseStatus(course.startDate, course.endDate),
      }));

      return NextResponse.json({ courses: coursesWithStatus });
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
        location: data.location, // Location enum 값 추가
        contents: data.contents, // Contents enum 값 추가
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
        price: data.price || 0,
      },
    });

    // ClassDate 레코드 생성 (startTime과 endTime 추가)
    if (classDatesData.length > 0) {
      await Promise.all(
        classDatesData.map((dateItem: any) =>
          prisma.classDate.create({
            data: {
              courseId: course.id,
              date: new Date(dateItem.date),
              dayOfWeek: dateItem.dayOfWeek,
              startTime: data.startTime || null, // 강좌의 시작 시간 사용
              endTime: data.endTime || null, // 강좌의 종료 시간 사용
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

    // 강좌 상태 계산
    const courseStatus = calculateCourseStatus(courseWithDates?.startDate || null, courseWithDates?.endDate || null);

    return NextResponse.json({
      course: {
        ...courseWithDates,
        status: courseStatus,
      },
    });
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
      // 1. 기존 수업 날짜와 새로운 수업 날짜 비교
      const existingClassDateIds = existingCourse.classDates.map((date) => date.id);

      // 2. 출석 기록이 없는 수업 날짜만 삭제 (안전하게 하나씩 확인)
      for (const classDateId of existingClassDateIds) {
        // 해당 수업 날짜에 연결된 출석 기록이 있는지 확인
        const attendanceCount = await prisma.attendance.count({
          where: { classDateId },
        });

        // 출석 기록이 없는 경우에만 삭제
        if (attendanceCount === 0) {
          await prisma.classDate.delete({
            where: { id: classDateId },
          });
        }
      }

      // 3. 강좌 정보 업데이트
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          location: data.location,
          contents: data.contents,
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
          price: data.price,
        },
      });

      // 4. 새 수업 날짜 추가 (기존에 없던 날짜만)
      if (classDatesData.length > 0) {
        const existingDates = new Set(existingCourse.classDates.map((date) => new Date(date.date).toISOString().split("T")[0]));

        for (const dateItem of classDatesData) {
          const dateStr = new Date(dateItem.date).toISOString().split("T")[0];

          // 기존에 없는 날짜만 추가
          if (!existingDates.has(dateStr)) {
            await prisma.classDate.create({
              data: {
                courseId: id,
                date: new Date(dateItem.date),
                dayOfWeek: dateItem.dayOfWeek,
                startTime: data.startTime || null,
                endTime: data.endTime || null,
              },
            });
          }
        }
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

    // 강좌 상태 계산
    const courseStatus = calculateCourseStatus(courseWithDates?.startDate || null, courseWithDates?.endDate || null);

    return NextResponse.json({
      course: {
        ...courseWithDates,
        status: courseStatus,
      },
    });
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
