import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Contents } from "@prisma/client"; // Prisma 연결

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day")) || 1;
  const selectedCourseContents = url.searchParams.get("selectedCourseContents");

  const sentences = await prisma.sentence.findMany({
    where: {
      contents: selectedCourseContents as Contents,
    },
    skip: (day - 1) * 5,
    take: 5,
  });
  console.log("sentences: ", sentences);

  return NextResponse.json(sentences);
}
