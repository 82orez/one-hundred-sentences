// app/api/admin/enrollments/bulk/route.ts
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
    const { courseId, courseTitle, students } = body;

    // 필수 필드 확인
    if (!courseId || !courseTitle || !students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ message: "유효한 데이터가 없습니다." }, { status: 400 });
    }

    // 코스 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "존재하지 않는 강좌입니다." }, { status: 404 });
    }

    // 결과를 저장할 변수
    const results = {
      successCount: 0,
      failedCount: 0,
      successfulEnrollments: [],
      failedEnrollments: [],
    };

    // 각 학생을 등록 처리
    for (const student of students) {
      try {
        const { studentName, studentPhone, centerName, localName, description } = student;

        // 필수 필드 확인
        if (!studentName || !studentPhone) {
          results.failedCount++;
          results.failedEnrollments.push({
            studentName: studentName || "이름 없음",
            studentPhone: studentPhone || "번호 없음",
            reason: "이름이나 전화번호가 누락되었습니다.",
          });
          continue;
        }

        // 전화번호 정리 (하이픈 제거)
        const cleanPhone = studentPhone.replace(/-/g, "").replace(/\s/g, "");

        // 전화번호 유효성 검사
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(cleanPhone)) {
          results.failedCount++;
          results.failedEnrollments.push({
            studentName,
            studentPhone,
            reason: "전화번호 형식이 유효하지 않습니다.",
          });
          continue;
        }

        // 이름 공백 제거
        const cleanName = studentName.replace(/\s/g, "");

        // 중복 등록 확인
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            courseId,
            studentPhone: cleanPhone,
          },
        });

        if (existingEnrollment) {
          results.failedCount++;
          results.failedEnrollments.push({
            studentName,
            studentPhone,
            reason: "이미 등록된 전화번호입니다.",
          });
          continue;
        }

        // 수강생 등록
        const enrollment = await prisma.enrollment.create({
          data: {
            courseId,
            courseTitle,
            studentName: cleanName,
            studentPhone: cleanPhone,
            centerName,
            localName,
            description,
            status: "pending",
          },
        });

        results.successCount++;
        results.successfulEnrollments.push({
          id: enrollment.id,
          studentName: cleanName,
          studentPhone: cleanPhone,
          centerName,
          localName,
          description,
        });
      } catch (studentError) {
        console.error("개별 수강생 등록 오류:", studentError);
        results.failedCount++;
        results.failedEnrollments.push({
          studentName: student.studentName || "이름 없음",
          studentPhone: student.studentPhone || "번호 없음",
          reason: "처리 중 오류가 발생했습니다.",
        });
      }
    }

    return NextResponse.json(
      {
        message: `${results.successCount}명의 수강생이 등록되었습니다. ${results.failedCount}명 실패.`,
        successCount: results.successCount,
        failedCount: results.failedCount,
        successfulEnrollments: results.successfulEnrollments,
        failedEnrollments: results.failedEnrollments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("수강생 일괄 등록 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
