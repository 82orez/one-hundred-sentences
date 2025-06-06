import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ GET: 현재 사용자의 nextday 정보를 가져옴
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "코스 ID가 필요합니다." }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    // 사용자와 코스에 대한 nextday 정보 조회
    let userNextDayData = await prisma.userNextDay.findFirst({
      where: { userId, courseId },
    });

    // 없으면 기본값 생성
    if (!userNextDayData) {
      userNextDayData = await prisma.userNextDay.create({
        data: {
          userId,
          courseId,
          userNextDay: 1,
          totalCompleted: false,
        },
      });
    }

    return NextResponse.json(userNextDayData);
  } catch (error) {
    console.error("nextday 정보 조회 중 오류:", error);
    return NextResponse.json({ error: "nextday 정보를 가져오는데 실패했습니다." }, { status: 500 });
  }
}

// ✅ POST: 사용자의 nextday 정보 업데이트
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;
  const { courseId, nextDay, totalCompleted } = await request.json();

  if (!courseId) {
    return NextResponse.json({ error: "코스 ID가 필요합니다." }, { status: 400 });
  }

  try {
    // 기존 데이터 찾기
    let userNextDayData = await prisma.userNextDay.findFirst({
      where: { userId, courseId },
    });

    // 결과 데이터
    let result;

    if (userNextDayData) {
      // 기존 데이터 업데이트
      result = await prisma.userNextDay.update({
        where: { id: userNextDayData.id },
        data: {
          userNextDay: nextDay,
          totalCompleted: totalCompleted ?? userNextDayData.totalCompleted,
        },
      });
    } else {
      // 새로 생성
      result = await prisma.userNextDay.create({
        data: {
          userId,
          courseId,
          userNextDay: nextDay ?? 1,
          totalCompleted: totalCompleted ?? false,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("nextday 업데이트 중 오류:", error);
    return NextResponse.json({ error: "nextday 정보 업데이트에 실패했습니다." }, { status: 500 });
  }
}
