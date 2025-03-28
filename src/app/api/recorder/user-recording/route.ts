// src/app/api/recordings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sentenceNo = Number(url.searchParams.get("sentenceNo"));
  const userId = url.searchParams.get("userId");

  if (!sentenceNo || !userId) {
    return NextResponse.json({ error: "문장 번호와 사용자 ID가 필요합니다" }, { status: 400 });
  }

  try {
    // 사용자의 녹음 파일 정보 조회
    const recording = await prisma.recordings.findFirst({
      where: {
        userId: userId,
        sentenceNo: sentenceNo,
      },
    });

    if (!recording) {
      return NextResponse.json({ error: "녹음 파일이 없습니다" }, { status: 404 });
    }

    return NextResponse.json({ url: recording.fileUrl });
  } catch (error) {
    console.error("녹음 파일 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "녹음 파일 조회에 실패했습니다" }, { status: 500 });
  }
}
