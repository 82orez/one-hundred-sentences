// src/app/api/payment/check-user-info/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { realName: true, phone: true },
    });

    return NextResponse.json({
      isProfileComplete: !!(user?.realName && user?.phone),
    });
  } catch (error) {
    console.error("Error checking user info:", error);
    return NextResponse.json({ error: "사용자 정보를 확인하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
