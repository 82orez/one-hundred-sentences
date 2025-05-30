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
    const { realName, phone, classNickName, message, isImagePublicOpen, isApplyForTeacher, zoomInviteUrl } = await req.json();

    // 필수 정보 유효성 검사
    if (!realName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 전화번호 형식 검증 (000-0000-0000)
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Zoom URL 유효성 검사 (선택적)
    let validatedZoomUrl = undefined;
    if (zoomInviteUrl) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "teacher") {
        return NextResponse.json({ error: "Zoom URL은 강사만 등록할 수 있습니다." }, { status: 403 });
      }

      try {
        const url = new URL(zoomInviteUrl);
        if (url.protocol !== "https:") {
          return NextResponse.json({ error: "Zoom URL은 https 형식이어야 합니다." }, { status: 400 });
        }
        validatedZoomUrl = zoomInviteUrl;
      } catch {
        return NextResponse.json({ error: "유효한 URL 형식이 아닙니다." }, { status: 400 });
      }
    }

    // 전화번호 중복 확인
    const existingUserWithPhone = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: session.user.id },
      },
    });

    if (existingUserWithPhone) {
      return NextResponse.json({ error: "이미 가입된 전화번호입니다." }, { status: 409 });
    }

    // 닉네임 중복 확인
    if (classNickName) {
      const existingUserWithNick = await prisma.user.findFirst({
        where: {
          classNickName,
          id: { not: session.user.id },
        },
      });

      if (existingUserWithNick) {
        return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 409 });
      }
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        realName,
        phone,
        classNickName,
        message,
        isImagePublicOpen: isImagePublicOpen !== undefined ? isImagePublicOpen : undefined,
        isApplyForTeacher: isApplyForTeacher !== undefined ? isApplyForTeacher : undefined,
        zoomInviteUrl: validatedZoomUrl !== undefined ? validatedZoomUrl : undefined,
      },
    });

    // 사용자가 실제 이름과 전화번호를 등록했다면 무료 체험반에 자동 등록
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: "freecoursetour",
      },
    });

    // 이미 무료 체험반에 등록되어 있지 않은 경우에만 등록
    if (!existingEnrollment && realName && phone) {
      await prisma.enrollment.create({
        data: {
          courseId: "freecoursetour",
          courseTitle: "무료 체험반",
          studentId: session.user.id,
          studentName: realName,
          studentPhone: phone,
          status: "active",
        },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
