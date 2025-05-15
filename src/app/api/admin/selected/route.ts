// /app/api/admin/selected/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await request.json();
    const { selectedCourseId, selectedCourseContents, selectedCourseTitle } = body;

    // Selected 모델의 첫 번째 레코드를 찾거나 생성
    const selected = await prisma.selected.upsert({
      where: { id: "1" }, // 항상 같은 레코드를 업데이트
      update: {
        selectedCourseId,
        selectedCourseContents,
        selectedCourseTitle,
      },
      create: {
        id: "1",
        selectedCourseId,
        selectedCourseContents,
        selectedCourseTitle,
      },
    });

    return NextResponse.json(selected);
  } catch (error) {
    console.error("코스 선택 정보 저장 오류:", error);
    return NextResponse.json({ error: "코스 선택 정보를 저장하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
