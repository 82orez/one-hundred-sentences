import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const courseId = url.searchParams.get("courseId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const completedSentences = await prisma.completedSentence.findMany({
      where: {
        userId,
        ...(courseId ? { courseId } : {}),
      },
      select: {
        sentenceNo: true,
      },
    });

    return NextResponse.json(completedSentences);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sentenceNo, courseId } = await req.json();
  const userId = session.user.id;
  const userEmail = session.user.email;

  if (!sentenceNo || typeof sentenceNo !== "number") {
    return NextResponse.json({ error: "Invalid sentenceNo format" }, { status: 400 });
  }

  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "Invalid courseId format" }, { status: 400 });
  }

  try {
    // ✅ Sentence 테이블에서 sentenceNo가 존재하는지 확인
    const sentenceExists = await prisma.sentence.findUnique({
      where: { no: sentenceNo }, // sentenceNo를 기준으로 확인
    });

    if (!sentenceExists) {
      return NextResponse.json({ error: "Invalid sentenceNo" }, { status: 400 });
    }

    // ✅ 이미 완료한 문장인지 확인하고 기완료된 문장이면 메세지 반환 -> error X
    const existing = await prisma.completedSentence.findUnique({
      where: {
        userId_courseId_sentenceNo: {
          userId,
          courseId,
          sentenceNo,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Sentence already completed" });
    }

    // ✅ 완료된 문장을 새로 추가
    const completedSentence = await prisma.completedSentence.create({
      data: {
        userId,
        userEmail,
        sentenceNo,
        courseId,
      },
    });

    return NextResponse.json(completedSentence);
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
