// src/app/api/payment/check-already-enrolled/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
      },
    });

    return NextResponse.json({ exists: !!enrollment });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ error: "수강 신청 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
