import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!session?.user) {
    return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    // 특정 사용자 ID가 제공된 경우 해당 사용자의 데이터를 반환
    if (userId) {
      const selected = await prisma.selected.findUnique({
        where: { userId },
      });

      if (!selected) {
        return NextResponse.json({}, { status: 404 });
      }

      return NextResponse.json(selected);
    }

    // 사용자 ID가 제공되지 않은 경우 현재 로그인한 사용자의 데이터를 반환
    const currentUserId = session.user.id;
    const selected = await prisma.selected.findUnique({
      where: { userId: currentUserId },
    });

    if (!selected) {
      return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json(selected);
  } catch (error) {
    console.error("Selected 조회 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { selectedCourseId, selectedCourseContents, selectedCourseTitle } = body;

    if (!selectedCourseId || !selectedCourseContents || !selectedCourseTitle) {
      return NextResponse.json({ message: "필수 필드가 누락되었습니다." }, { status: 400 });
    }

    // 기존에 저장된 것이 있으면 업데이트, 없으면 새로 생성
    const selected = await prisma.selected.upsert({
      where: { userId },
      update: {
        selectedCourseId,
        selectedCourseContents,
        selectedCourseTitle,
      },
      create: {
        userId,
        selectedCourseId,
        selectedCourseContents,
        selectedCourseTitle,
      },
    });

    return NextResponse.json({ message: "저장 완료", selected });
  } catch (error) {
    console.error("Selected 저장 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
