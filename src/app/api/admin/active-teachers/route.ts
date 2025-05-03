import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 활성화된 강사만 가져오기
    const teachers = await prisma.teachers.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        realName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("강사 목록 조회 오류:", error);
    return NextResponse.json({ error: "강사 목록을 불러오는데 실패했습니다." }, { status: 500 });
  }
}
