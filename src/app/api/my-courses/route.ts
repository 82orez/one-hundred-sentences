// src/app/api/my-courses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const userId = session.user.id;

    // 학생인 경우, 등록한 강좌 조회
    if (session.user.role === "student") {
      const enrolledCourses = await prisma.enrollment.findMany({
        where: {
          studentName: session.user.realName,
          studentPhone: session.user.phone.replace(/-/g, ""), // ✅ 서버의 전화번호 정보에서 하이픈 제거,
        },
        include: {
          course: {
            include: {
              classDates: true,
              teacher: {
                include: {
                  user: true, // ⬅️ Course.teacher.user 정보까지 포함
                },
              },
            },
          },
        },
      });

      return NextResponse.json({ courses: enrolledCourses });
    }

    // 교사인 경우, 자신이 가르치는 강좌 조회
    if (session.user.role === "teacher") {
      const teacherId = await prisma.teachers.findUnique({
        where: { userId },
        include: {
          user: true, // ⬅️ 여기서 가져오고
        },
      });

      if (!teacherId) {
        return NextResponse.json({ error: "교사 정보를 찾을 수 없습니다" }, { status: 404 });
      }

      const teachingCourses = await prisma.course.findMany({
        where: {
          teacherId: teacherId.id,
        },
        include: {
          classDates: true,
          enrollments: true,
          teacher: {
            include: {
              user: true, // ⬅️ Course.teacher.user 정보까지 포함
            },
          },
        },
      });

      return NextResponse.json({ courses: teachingCourses });
    }

    // 관리자인 경우, 모든 또는 생성한 강좌 조회
    if (session.user.role === "admin" || session.user.role === "semiAdmin") {
      const createdCourses = await prisma.course.findMany({
        where: {
          generatorId: userId,
        },
        include: {
          teacher: {
            include: {
              user: true, // teacher.user
            },
          },
          generator: true, // generator = User
          classDates: true,
          enrollments: true,
        },
      });

      return NextResponse.json({ courses: createdCourses });
    }

    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  } catch (error) {
    console.error("내 강좌 조회 오류:", error);
    return NextResponse.json({ error: "강좌 조회 중 오류가 발생했습니다" }, { status: 500 });
  }
}
