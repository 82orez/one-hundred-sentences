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
        isActive: true,
        nation: true,
        subject: true,
        nickName: true,
        user: {
          select: {
            realName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // user 모델의 필드를 최상위 레벨로 재구성
    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      realName: teacher.user.realName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      isActive: teacher.isActive,
      nation: teacher.nation,
      subject: teacher.subject,
      nickName: teacher.nickName,
    }));

    return NextResponse.json({ teachers: formattedTeachers });
  } catch (error) {
    console.error("강사 목록 조회 오류:", error);
    return NextResponse.json({ error: "강사 목록을 불러오는데 실패했습니다." }, { status: 500 });
  }
}
