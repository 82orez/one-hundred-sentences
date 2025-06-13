// src/app/api/course-points/each-student-rank/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStudentDetailPoints } from "@/utils/countTotalEachPoints";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
  }

  try {
    // 해당 강좌에 등록된 모든 학생 목록 가져오기
    const enrolledStudents = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: "active",
      },
      select: {
        studentId: true,
        student: {
          select: {
            id: true,
            realName: true,
            classNickName: true,
            image: true,
            customImageUrl: true,
          },
        },
      },
    });

    // 각 학생의 포인트 정보 계산
    const pointsPromises = enrolledStudents.map(async (enrollment) => {
      try {
        const pointsData = await calculateStudentDetailPoints(courseId, enrollment.studentId);

        return {
          userId: enrollment.studentId,
          courseId: courseId,
          points: pointsData.totalPoints,
          user: enrollment.student,
        };
      } catch (error) {
        console.error(`학생 ${enrollment.studentId}의 포인트 계산 중 오류 발생:`, error);
        return {
          userId: enrollment.studentId,
          courseId: courseId,
          points: 0, // 오류 발생 시 기본값
          user: enrollment.student,
        };
      }
    });

    const points = await Promise.all(pointsPromises);

    // 포인트 기준으로 내림차순 정렬
    const sortedPoints = points.sort((a, b) => b.points - a.points);

    return NextResponse.json(sortedPoints);
  } catch (error) {
    console.error("포인트 정보를 가져오는 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 정보를 가져오는데 실패했습니다." }, { status: 500 });
  }
}
