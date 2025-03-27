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

    // ✅ 학습일별 완료된 문장 개수를 계산
    const dayCounts: Record<number, number> = {};
    completedSentences.forEach(({ sentenceNo }) => {
      const day = Math.ceil(sentenceNo / 5);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    console.log("dayCounts: ", dayCounts);

    // ✅ 5문장을 모두 완료한 학습일만 필터링
    const completedDays = Object.keys(dayCounts)
      .map(Number)
      .filter((day) => dayCounts[day] === 5); // ✅ 학습일에 속한 5문장이 전부 완료된 경우만 반환

    console.log("completedDays: ", completedDays);
    return NextResponse.json({ completedDays });
  } catch (error) {
    console.error("Failed to fetch review data:", error);
    return NextResponse.json({ error: "Failed to fetch review data" }, { status: 500 });
  }
}
