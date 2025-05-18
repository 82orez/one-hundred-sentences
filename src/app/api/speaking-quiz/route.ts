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

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const completedSentences = await prisma.completedSentence.findMany({
      where: {
        userId,
        courseId,
      },
      include: { sentence: true },
    });

    return NextResponse.json(completedSentences);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 });
  }
}
