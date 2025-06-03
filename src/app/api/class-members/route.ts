// src/app/api/class-members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    // 해당 강좌를 수강 중인 사용자 목록 조회
    // status가 pending 또는 active인 수강생만 필터링
    const members = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: {
          in: ["pending", "active"],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            role: true,
            name: true,
            realName: true,
            classNickName: true,
            image: true,
            customImageUrl: true,
            isImagePublicOpen: true,
            message: true, // 자기 소개
          },
        },
      },
    });

    // 수강생 정보 가공 (개인정보 보호 및 필요한 정보만 반환)
    const membersList = members.map((enrollment) => {
      const student = enrollment.student;
      const displayName = student?.classNickName || student?.realName || student?.name || "익명";

      // 프로필 이미지: 공개 설정된 경우에만 이미지 URL 포함
      const profileImage = student?.isImagePublicOpen ? student.customImageUrl || student.image : null;

      return {
        id: student?.id,
        role: student?.role,
        displayName,
        profileImage,
        hasIntroduction: !!student?.message,
        message: student?.message || null,
      };
    });

    return NextResponse.json({ members: membersList });
  } catch (error) {
    console.error("수강생 목록 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
