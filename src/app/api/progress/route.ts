import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const completedSentences = await prisma.completedSentence.findMany({
      include: {
        sentence: true, // 문장 데이터 포함
      },
    });
    console.log("completedSentences: ", completedSentences);

    return NextResponse.json(completedSentences);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
