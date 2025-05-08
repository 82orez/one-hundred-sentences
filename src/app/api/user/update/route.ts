import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { realName, phone, isApplyForTeacher } = await req.json();

    // 필수 정보 유효성 검사
    if (!realName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 전화번호 형식 검증 (000-0000-0000)
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // 전화번호 중복 확인 - 자신을 제외한 다른 사용자의 번호와 중복 체크
    const existingUserWithPhone = await prisma.user.findFirst({
      where: {
        phone: phone,
        id: {
          not: session.user.id,
        },
      },
    });

    if (existingUserWithPhone) {
      return NextResponse.json({ error: "이미 가입된 전화번호입니다." }, { status: 409 });
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        realName,
        phone,
        isApplyForTeacher: isApplyForTeacher !== undefined ? isApplyForTeacher : undefined,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
