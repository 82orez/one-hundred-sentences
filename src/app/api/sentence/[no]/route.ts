// src/app/api/sentence/[no]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { no: string } }
) {
  try {
    const sentenceNo = parseInt(params.no, 10);

    if (isNaN(sentenceNo)) {
      return NextResponse.json(
        { error: "유효하지 않은 문장 번호입니다" },
        { status: 400 }
      );
    }

    const sentence = await prisma.sentence.findUnique({
      where: { no: sentenceNo },
    });

    if (!sentence) {
      return NextResponse.json(
        { error: "해당 번호의 문장을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(sentence);
  } catch (error) {
    console.error("문장 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "문장 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}