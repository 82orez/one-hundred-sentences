import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    const userId = session.user.id;

    // User 모델의 isApplyForTeacher 필드를 false로 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApplyForTeacher: false },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("강사 신청 취소 오류:", error);
    return NextResponse.json({ error: "강사 신청 취소 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
