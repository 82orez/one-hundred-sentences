import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prisma 연결

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day")) || 1;

  const sentences = await prisma.sentence.findMany({
    skip: (day - 1) * 5,
    take: 5,
  });

  return NextResponse.json(sentences);
}
