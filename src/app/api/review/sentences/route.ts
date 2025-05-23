import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Contents } from "@prisma/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day"));
  const selectedCourseContents = url.searchParams.get("selectedCourseContents");

  if (!day || day < 1 || day > 20) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  try {
    // ✅ 해당 학습일(day)의 문장 5개 가져오기
    // selectedCourseContents 값이 있으면 contents 필드와 일치하는 조건 추가
    const whereClause: any = {
      no: { gte: (day - 1) * 5 + 1, lte: day * 5 },
    };

    // selectedCourseContents 값이 있을 때만 contents 조건 추가
    if (selectedCourseContents) {
      whereClause.contents = selectedCourseContents as Contents;
    }

    const sentences = await prisma.sentence.findMany({
      where: whereClause,
      orderBy: { no: "asc" },
    });

    return NextResponse.json(sentences);
  } catch (error) {
    console.error("Failed to fetch review sentences:", error);
    return NextResponse.json({ error: "Failed to fetch review sentences" }, { status: 500 });
  }
}
