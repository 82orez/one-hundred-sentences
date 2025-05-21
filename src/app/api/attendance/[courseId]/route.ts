// /app/api/attendance/[courseId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "인증되지 않았습니다." }, { status: 401 });
    }

    const courseId = params.courseId;

    // 해당 강좌의 수업 일정 조회
    const classDates = await prisma.classDate.findMany({
      where: { courseId },
      orderBy: { date: 'asc' },
    });

    // 등록된 학생 목록 조회
    const students = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: "active",
      },
      select: {
        id: true,
        studentId: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            realName: true,
          },
        },
      },
    });

    // 각 학생별 출석 정보 조회
    const studentsWithAttendance = await Promise.all(
      students.map(async (enrollment) => {
        const userId = enrollment.studentId;

        if (!userId) return null; // studentId가 없는 경우 처리

        const attendance = await prisma.attendance.findMany({
          where: {
            userId,
            courseId,
          },
        });

        return {
          id: enrollment.studentId,
          name: enrollment.student?.realName || enrollment.student?.name,
          email: enrollment.student?.email,
          attendance: attendance,
        };
      })
    );

    // null 값 제거 (studentId가 없는 등록 정보 제외)
    const filteredStudents = studentsWithAttendance.filter(student => student !== null);

    return NextResponse.json({
      students: filteredStudents,
      classDates: classDates,
    });
  } catch (error) {
    console.error("출석부 조회 오류:", error);
    return NextResponse.json({ error: "출석부 정보를 불러오는데 실패했습니다." }, { status: 500 });
  }
}