import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day"));

  if (!day || day < 1 || day > 20) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  try {
    // ✅ 해당 학습일(day)의 문장 5개 가져오기
    const sentences = await prisma.sentence.findMany({
      where: {
        no: { gte: (day - 1) * 5 + 1, lte: day * 5 },
      },
      orderBy: { no: "asc" },
    });

    return NextResponse.json(sentences);
  } catch (error) {
    console.error("Failed to fetch review sentences:", error);
    return NextResponse.json({ error: "Failed to fetch review sentences" }, { status: 500 });
  }
}
