import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 세션에서 사용자 정보 가져오기
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    // 요청 본문에서 데이터 추출
    const { classDateId, courseId } = await request.json();

    if (!classDateId || !courseId) {
      return NextResponse.json({ error: "필수 매개변수가 누락되었습니다." }, { status: 400 });
    }

    // 수업 정보 가져오기
    const classDate = await prisma.classDate.findUnique({
      where: { id: classDateId },
      include: { course: true },
    });

    if (!classDate) {
      return NextResponse.json({ error: "수업 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 현재 시간 가져오기
    const currentTime = new Date();

    // 수업 시작 시간을 Date 객체로 변환
    const classDate_obj = new Date(classDate.date);
    const [hours, minutes] = (classDate.startTime || "00:00").split(":").map(Number);
    classDate_obj.setHours(hours, minutes, 0, 0);

    // 수업 종료 시간을 Date 객체로 변환
    const classEndDate_obj = new Date(classDate.date);
    const [endHours, endMinutes] = (classDate.endTime || "00:00").split(":").map(Number);
    classEndDate_obj.setHours(endHours, endMinutes, 0, 0);

    // 수업 종료 시간이 지났는지 확인
    if (currentTime > classEndDate_obj) {
      return NextResponse.json({ error: "수강 시간이 지났습니다.", isAttended: false }, { status: 400 });
    }

    // 수업 시작 15분 전 시간 계산
    const fifteenMinutesBeforeClass = new Date(classDate_obj);
    fifteenMinutesBeforeClass.setMinutes(fifteenMinutesBeforeClass.getMinutes() - 15);

    // 현재 시간이 수업 시작 15분 전보다 이전인지 확인
    if (currentTime < fifteenMinutesBeforeClass) {
      return NextResponse.json({ error: "아직 수업이 시작되지 않았습니다.", isAttended: false }, { status: 400 });
    }

    // 기존 출석 기록 확인
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        classDateId: classDateId,
      },
    });

    // 출석 상태 업데이트 또는 생성
    let attendance;

    if (existingAttendance) {
      // 이미 출석 기록이 있으면 업데이트
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { isAttended: true },
      });
    } else {
      // 출석 기록이 없으면 새로 생성
      attendance = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          courseId: courseId,
          classDateId: classDateId,
          isAttended: true,
        },
      });
    }

    return NextResponse.json({
      message: "출석이 완료되었습니다.",
      isAttended: true,
      attendance,
    });
  } catch (error) {
    console.error("출석 기록 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다.", isAttended: false }, { status: 500 });
  }
}
