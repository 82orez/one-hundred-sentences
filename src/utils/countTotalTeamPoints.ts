import { PrismaClient } from "@prisma/client";
import { calculateUserActivityPoints } from "./calculatePointsUtils";

const prisma = new PrismaClient();

/**
 * 특정 강좌를 수강하는 전체 학생들의 개별 포인트를 합산하여 반환하는 함수
 * @param courseId 강좌 ID
 * @returns 강좌에 속한 학생들의 총 포인트 합계
 */
export async function calculateTotalTeamPoints(courseId: string) {
  if (!courseId) {
    throw new Error("강좌 ID가 필요합니다.");
  }

  try {
    // 1. 해당 강좌에 등록된 모든 학생 조회
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: "active", // 활성 상태인 등록만 고려
      },
      select: {
        studentId: true,
      },
    });

    // 학생 ID 목록 추출
    const studentIds = enrollments.map((enrollment) => enrollment.studentId).filter((id): id is string => id !== null); // null 값 제거

    if (studentIds.length === 0) {
      return { totalTeamPoints: 0, studentCount: 0 };
    }

    // 2. 각 학생의 포인트 데이터 조회 및 계산
    const pointsData = await Promise.all(
      studentIds.map(async (studentId) => {
        const { points } = await calculateUserActivityPoints(studentId, courseId);
        return points.totalPoints;
      }),
    );

    // 3. 모든 학생의 포인트 합산
    const totalTeamPoints = pointsData.reduce((sum, points) => sum + points, 0);

    return {
      totalTeamPoints,
      studentCount: studentIds.length,
    };
  } catch (error) {
    console.error("팀 포인트 계산 중 오류 발생:", error);
    throw new Error("팀 포인트 계산 중 오류가 발생했습니다.");
  }
}
