import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teacherId = url.searchParams.get("selectedTeacherId");

    const teacher = await prisma.teachers.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        user: {
          select: {
            email: true,
            realName: true,
            phone: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "강사를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("강사 정보 조회 오류:", error);
    return NextResponse.json({ error: "강사 정보를 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
