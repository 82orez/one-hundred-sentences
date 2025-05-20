// /app/api/user/attendance/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json({ error: "사용자 ID와 강좌 ID가 필요합니다." }, { status: 400 });
    }

    // 현재 날짜 기준으로 진행해야 할 강좌의 전체 수업일 수 조회
    const today = new Date();
    const totalClassDates = await prisma.classDate.count({
      where: {
        courseId: courseId,
        date: {
          lte: today, // 오늘 또는 이전 날짜의 수업만
        },
      },
    });

    // 사용자가 출석한 수업일 수 조회
    const attendedClassDates = await prisma.attendance.count({
      where: {
        userId: userId,
        courseId: courseId,
        isAttended: true,
        classDate: {
          date: {
            lte: today, // 오늘 또는 이전 날짜의 수업만
          },
        },
      },
    });

    return NextResponse.json({
      totalClassDates,
      attendedClassDates,
    });
  } catch (error) {
    console.error("출석 정보 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "출석 정보를 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
