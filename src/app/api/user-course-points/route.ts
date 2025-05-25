import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // UserCoursePoints 데이터를 가져오면서 Enrollment 정보 함께 조회
    const userPoints = await prisma.userCoursePoints.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        points: "desc", // 기본적으로 높은 점수 순으로 정렬
      },
      include: {
        user: {
          select: {
            id: true,
            // name: true,
            classNickName: true,
            email: true,
            image: true,
            customImageUrl: true,
            Enrollment: {
              where: {
                courseId: courseId,
              },
              select: {
                studentName: true,
                centerName: true,
                localName: true,
              },
            },
          },
        },
      },
    });

    // 응답 데이터 가공
    const formattedData = userPoints.map((point) => ({
      id: point.id,
      userId: point.userId,
      courseId: point.courseId,
      points: point.points,
      // userName: point.user.name || "이름 없음",
      userClassNickName: point.user.classNickName,
      userEmail: point.user.email,
      userImage: point.user.customImageUrl || point.user.image, // customImageUrl 우선, 없으면 image 사용
      userName: point.user.Enrollment[0]?.studentName || null,
      centerName: point.user.Enrollment[0]?.centerName || null,
      localName: point.user.Enrollment[0]?.localName || null,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("포인트 데이터 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
