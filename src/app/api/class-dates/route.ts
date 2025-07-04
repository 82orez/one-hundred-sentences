import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "강좌 ID가 필요합니다." }, { status: 400 });
  }
  try {
    const classDates = await prisma.classDate.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(classDates);
  } catch (error) {
    console.error("Error fetching class dates:", error);
    return NextResponse.json({ error: "Failed to fetch class dates" }, { status: 500 });
  }
}
