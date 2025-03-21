// src/app/api/teacher/stats/route.tsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // 현재 로그인한 사용자 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 현재 사용자가 강사인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !(user.role === "teacher" || user.role === "admin")) {
      return NextResponse.json({ error: "강사 권한이 없습니다." }, { status: 403 });
    }

    // 강사의 강좌 수 조회
    const totalCourses = await prisma.course.count({
      where: {
        teacherId: user.id,
      },
    });

    // 강사의 강좌를 수강 중인 학생 수 조회 (중복 제거)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: user.id,
        },
      },
      select: {
        studentId: true,
      },
      distinct: ["studentId"],
    });

    const totalStudents = enrollments.length;

    // 미확인 과제 수 조회
    const pendingAssignments = await prisma.submission.count({
      where: {
        assignment: {
          course: {
            teacherId: user.id,
          },
        },
        gradedAt: null, // evaluated 대신 gradedAt이 null 인 경우를 미확인 과제로 간주
      },
    });

    // 통계 데이터 반환
    return NextResponse.json({
      totalCourses,
      totalStudents,
      pendingAssignments,
    });
  } catch (error) {
    console.error("통계 데이터 조회 오류:", error);
    return NextResponse.json({ error: "통계 데이터를 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
