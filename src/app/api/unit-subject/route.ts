import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // URL 에서 unitNumber 파라미터 추출
    const { searchParams } = new URL(request.url);
    const unitNumberParam = searchParams.get("unitNumber");

    // 파라미터 유효성 검사
    if (!unitNumberParam) {
      return NextResponse.json({ error: "unitNumber 파라미터가 필요합니다." }, { status: 400 });
    }

    // 문자열을 숫자로 변환
    const unitNumber = parseInt(unitNumberParam, 10);

    // 숫자 변환 실패 시
    if (isNaN(unitNumber)) {
      return NextResponse.json({ error: "유효한 unitNumber 가 필요합니다." }, { status: 400 });
    }

    // DB 에서 해당 unitNumber 를 가진 unitSubject 조회
    const unitSubject = await prisma.unitSubject.findFirst({
      where: { unitNumber },
      select: {
        subjectKo: true,
        subjectEn: true,
        unitUtubeUrl: true, // 추가
      },
    });

    // 해당 단원 정보가 없을 경우
    if (!unitSubject) {
      return NextResponse.json({ error: "해당 단원 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 성공적으로 찾은 경우
    return NextResponse.json(unitSubject);
  } catch (error) {
    console.error("단원 정보 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  } finally {
    // Prisma 클라이언트 연결 종료
    await prisma.$disconnect();
  }
}
