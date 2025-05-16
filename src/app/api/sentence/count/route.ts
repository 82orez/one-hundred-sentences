import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contents = searchParams.get("contents");

    if (!contents) {
      return NextResponse.json({ error: "Contents parameter is required" }, { status: 400 });
    }

    // Prisma를 사용하여 특정 contents 값을 가진 문장 개수 조회
    const count = await prisma.sentence.count({
      where: {
        contents: contents as any, // schema.prisma 에서 Contents는 enum 타입임
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting sentences:", error);
    return NextResponse.json({ error: "Failed to count sentences" }, { status: 500 });
  }
}
