// app/api/teachers/toggle-status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { teacherId, status } = await req.json();
    if (!teacherId || (status !== "active" && status !== "inactive")) {
      return NextResponse.json({ error: "강사 ID와 유효한 상태가 필요합니다" }, { status: 400 });
    }

    // 강사 상태 변경
    const updatedTeacher = await prisma.teachers.update({
      where: { id: teacherId },
      data: {
        status: status
      }
    });

    return NextResponse.json({
      message: `강사 상태가 ${status === "active" ? "활성화" : "비활성화"}되었습니다`,
      data: updatedTeacher
    });
  } catch (error) {
    console.error("강사 상태 변경 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}