import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateStudentDetailPoints } from "@/utils/countTotalEachPoints";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    // 강좌에 등록된 사용자 목록 조회
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: "active",
      },
      select: {
        studentId: true,
        student: {
          select: {
            id: true,
            classNickName: true,
            email: true,
            image: true,
            customImageUrl: true,
            isImagePublicOpen: true,
            message: true,
          },
        },
        studentName: true,
        centerName: true,
        localName: true,
      },
    });

    // 각 학생의 포인트 정보 계산
    const pointsPromises = enrollments.map(async (enrollment) => {
      try {
        const pointsData = await calculateStudentDetailPoints(courseId, enrollment.studentId);

        return {
          id: `${enrollment.studentId}-${courseId}`, // 고유 ID 생성
          userId: enrollment.studentId,
          courseId: courseId,
          points: pointsData.totalPoints,
          userClassNickName: enrollment.student.classNickName,
          userIsImagePublicOpen: enrollment.student.isImagePublicOpen,
          userEmail: enrollment.student.email,
          userImage: enrollment.student.customImageUrl || enrollment.student.image,
          userMessage: enrollment.student.message,
          userName: enrollment.studentName || null,
          centerName: enrollment.centerName || null,
          localName: enrollment.localName || null,
        };
      } catch (error) {
        console.error(`학생 ID ${enrollment.studentId}의 포인트 계산 중 오류:`, error);
        // 오류가 발생해도 기본 정보는 반환
        return {
          id: `${enrollment.studentId}-${courseId}`,
          userId: enrollment.studentId,
          courseId: courseId,
          points: 0, // 오류 발생 시 0점 처리
          userClassNickName: enrollment.student.classNickName,
          userIsImagePublicOpen: enrollment.student.isImagePublicOpen,
          userEmail: enrollment.student.email,
          userImage: enrollment.student.customImageUrl || enrollment.student.image,
          userMessage: enrollment.student.message,
          userName: enrollment.studentName || null,
          centerName: enrollment.centerName || null,
          localName: enrollment.localName || null,
        };
      }
    });

    const formattedData = await Promise.all(pointsPromises);

    // 포인트 내림차순으로 정렬
    const sortedData = formattedData.sort((a, b) => b.points - a.points);

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error("포인트 데이터 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
