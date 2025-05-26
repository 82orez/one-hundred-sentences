import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInMinutes } from "date-fns";

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

    // 현재 시간
    const now = new Date();
    const classDateObj = new Date(classDate.date);

    // 수업 시작 및 종료 시간 설정
    const classStartTimeArr = classDate.startTime?.split(":").map(Number) || [0, 0];
    const classEndTimeArr = classDate.endTime?.split(":").map(Number) || [0, 0];

    const classStartTime = new Date(classDateObj);
    classStartTime.setHours(classStartTimeArr[0], classStartTimeArr[1], 0);

    const classEndTime = new Date(classDateObj);
    classEndTime.setHours(classEndTimeArr[0], classEndTimeArr[1], 0);

    // 출석 가능 시작 시간 (수업 시작 15분 전)
    const attendanceStartTime = new Date(classStartTime);
    attendanceStartTime.setMinutes(attendanceStartTime.getMinutes() - 15);

    // 출석 상태 결정
    let isAttended = false;

    // 시간 조건 체크: 수업 시작 15분 전부터 수업 종료 시간까지
    if (now >= attendanceStartTime && now <= classEndTime) {
      isAttended = true;
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
      // 이미 기록이 있으면 업데이트
      // 출석이 인정된 경우에만 isAttended를 true로 설정
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          // 출석이 인정된 경우에만 true로 업데이트, 아니면 기존 값 유지
          isAttended: isAttended ? true : existingAttendance.isAttended,
        },
      });
    } else {
      // 새 출석 기록 생성
      attendance = await prisma.attendance.create({
        data: {
          courseId,
          userId: session.user.id,
          classDateId: classDateId,
          // 출석이 인정된 경우에만 true 저장
          isAttended: isAttended,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("출석 체크 실패:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
