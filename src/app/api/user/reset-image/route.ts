// app/api/user/reset-image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // customImageUrl 필드를 null로 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { customImageUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("이미지 초기화 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
