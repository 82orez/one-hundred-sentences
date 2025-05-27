import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 유저의 출석 상태 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    // 쿼리 파라미터 가져오기
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ message: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    // 사용자의 해당 강좌 출석 상태 조회
    const attendance = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
      include: {
        classDate: true, // ClassDate 정보 포함
      },
    });

    // 응답 형식 변환
    const formattedAttendance = attendance.map((att) => ({
      ...att,
      date: att.classDate.date, // ClassDate의 날짜 정보 사용
    }));

    return NextResponse.json(formattedAttendance);
  } catch (error) {
    console.error("출석 상태 조회 실패:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 출석 체크
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    // 요청 데이터 파싱
    const data = await request.json();
    const { classDateId, courseId } = data;

    if (!classDateId || !courseId) {
      return NextResponse.json({ message: "classDateId와 courseId는 필수 항목입니다." }, { status: 400 });
    }

    // 수업 정보 가져오기
    const classDate = await prisma.classDate.findUnique({
      where: { id: classDateId },
    });

    if (!classDate) {
      return NextResponse.json({ message: "해당 수업 일정을 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 출석 기록이 있는지 확인
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        classDateId: classDateId,
      },
    });

    let attendance;

    if (existingAttendance) {
      // 이미 기록이 있으면 isAttended를 true로 업데이트
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          isAttended: true,
        },
      });
    } else {
      // 새 출석 기록 생성
      attendance = await prisma.attendance.create({
        data: {
          courseId,
          userId: session.user.id,
          classDateId: classDateId,
          isAttended: true,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("출석 체크 실패:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
