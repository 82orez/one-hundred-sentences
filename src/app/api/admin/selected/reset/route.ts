// src/app/api/admin/selected/reset/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증되지 않았습니다." }, { status: 401 });
    }

    // 사용자의 Selected 데이터 초기화
    await prisma.selected.update({
      where: {
        userId: session.user.id,
      },
      data: {
        selectedCourseId: null,
        selectedCourseContents: null,
        selectedCourseTitle: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Selected 데이터 초기화 오류:", error);
    return NextResponse.json({ error: "Selected 데이터 초기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}
