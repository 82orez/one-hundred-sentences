import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prisma 연결

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day")) || 1;
  const selectedCourseContents = url.searchParams.get("selectedCourseContents");

  const sentences = await prisma.sentence.findMany({
    where: {
      ...(selectedCourseContents && {
        contents: selectedCourseContents as any, // 타입 에러를 우회하는 방법
      }),
    },
    skip: (day - 1) * 5,
    take: 5,
  });
  console.log("sentences: ", sentences);

  return NextResponse.json(sentences);
}
