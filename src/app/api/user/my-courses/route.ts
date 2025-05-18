import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = session.user.id;

    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        realName: true,
        phone: true,
      },
    });

    if (!user || !user.realName || !user.phone) {
      return NextResponse.json({
        message: "회원 정보(실명, 전화번호)를 완성해주세요.",
        pendingCourses: [],
        activeCourses: [],
      });
    }

    // 이름과 전화번호가 일치하는 pending 상태의 등록 목록
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentName: user.realName,
        studentPhone: user.phone.replace(/-/g, ""), // ✅ 서버의 전화번호 정보에서 하이픈 제거,
        status: "pending",
        studentId: null, // 아직 studentId가 설정되지 않은 것
      },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    realName: true,
                    email: true,
                    phone: true,
                    zoomInviteUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 사용자가 활성화한 수강 목록
    const activeEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: "active",
      },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    realName: true,
                    email: true,
                    phone: true,
                    zoomInviteUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      pendingCourses: pendingEnrollments,
      activeCourses: activeEnrollments,
    });
  } catch (error) {
    console.error("내 강의 조회 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 수강 시작 API
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ message: "등록 ID가 필요합니다." }, { status: 400 });
    }

    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        realName: true,
        phone: true,
      },
    });

    if (!user || !user.realName || !user.phone) {
      return NextResponse.json(
        {
          message: "회원 정보(실명, 전화번호)를 완성해주세요.",
        },
        { status: 400 },
      );
    }

    // 해당 등록 정보 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json({ message: "존재하지 않는 등록입니다." }, { status: 404 });
    }

    // ✅ 사용자 정보와 등록 정보 일치 확인 (서버의 전화번호 정보에서 하이픈 제거)
    if (enrollment.studentName !== user.realName || enrollment.studentPhone !== user.phone.replace(/-/g, "")) {
      return NextResponse.json({ message: "등록 정보와 회원 정보가 일치하지 않습니다." }, { status: 403 });
    }

    if (enrollment.status !== "pending") {
      return NextResponse.json({ message: "이미 활성화된 수강입니다." }, { status: 400 });
    }

    // 등록 정보 업데이트
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        studentId: userId,
        status: "active",
      },
    });

    return NextResponse.json({
      message: "수강이 성공적으로 시작되었습니다.",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("수강 시작 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
