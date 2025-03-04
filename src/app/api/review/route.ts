import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ 사용자가 완료한 문장 번호 목록 가져오기
    const completedSentences = await prisma.completedSentence.findMany({
      where: { userId: session.user.id },
      select: { sentenceNo: true },
    });

    // ✅ 완료한 문장 번호를 학습일(day)로 변환 (5개 단위로 묶음)
    const completedDays = new Set(completedSentences.map(({ sentenceNo }) => Math.ceil(sentenceNo / 5)));

    return NextResponse.json({ completedDays: Array.from(completedDays) });
  } catch (error) {
    console.error("Failed to fetch review data:", error);
    return NextResponse.json({ error: "Failed to fetch review data" }, { status: 500 });
  }
}
