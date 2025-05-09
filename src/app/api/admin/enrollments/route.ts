// app/api/admin/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
    }

    const body = await req.json();
    const { courseId, courseTitle, studentName, studentPhone, centerName, localName, description } = body;

    // 필수 필드 확인
    if (!courseId || !courseTitle || !studentName || !studentPhone) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    // 전화번호 정리 (하이픈 제거)
    const cleanPhone = studentPhone.replace(/-/g, "");

    // 코스 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "존재하지 않는 강좌입니다." }, { status: 404 });
    }

    // 중복 등록 확인 (같은 강좌에 같은 이름??, 같은 전화번호)
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        // studentName, // 중복 여부를 전화 번호로만 확인하기 위해 주석 처리함.
        studentPhone: cleanPhone,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: "이미 같은 전화번호로 등록된 수강생입니다." }, { status: 409 });
    }

    // 수강생 등록
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        courseTitle,
        studentName,
        studentPhone: cleanPhone,
        status: "pending",
        centerName,
        localName,
        description,
      },
    });

    return NextResponse.json(
      {
        message: "수강생이 성공적으로 등록되었습니다.",
        enrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("수강생 등록 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 수강생 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
    }

    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ message: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("수강생 조회 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("enrollmentId");

    // 등록 정보 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return NextResponse.json({ message: "존재하지 않는 등록 정보입니다." }, { status: 404 });
    }

    // 수강생 등록 정보 삭제
    await prisma.enrollment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "수강생 등록 정보가 삭제되었습니다." });
  } catch (error) {
    console.error("수강생 삭제 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
