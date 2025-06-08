// /api/my-voice-open/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId가 필요합니다." }, { status: 400 });
  }

  const voiceOpenList = await prisma.myVoiceOpenList.findMany({
    where: { userId, courseId },
    select: { sentenceNo: true },
  });

  return NextResponse.json(voiceOpenList);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;
  const { sentenceNo, courseId } = await req.json();

  if (!sentenceNo || !courseId) {
    return NextResponse.json({ error: "sentenceNo와 courseId가 필요합니다." }, { status: 400 });
  }

  const recording = await prisma.recordings.findFirst({
    where: { userId, courseId, sentenceNo },
  });

  if (!recording) {
    return NextResponse.json({ error: "녹음 파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const sentence = await prisma.sentence.findFirst({
    where: { no: sentenceNo },
  });

  if (!sentence) {
    return NextResponse.json({ error: "문장을 찾을 수 없습니다." }, { status: 404 });
  }

  const existingRecord = await prisma.myVoiceOpenList.findFirst({
    where: { userId, courseId, sentenceNo },
  });

  if (existingRecord) {
    const updated = await prisma.myVoiceOpenList.update({
      where: { id: existingRecord.id },
      data: {
        myVoiceUrl: recording.fileUrl,
        sentenceEn: sentence.en,
      },
    });
    return NextResponse.json(updated);
  } else {
    const created = await prisma.myVoiceOpenList.create({
      data: {
        userId,
        courseId,
        sentenceNo,
        sentenceEn: sentence.en,
        myVoiceUrl: recording.fileUrl,
      },
    });
    return NextResponse.json(created, { status: 201 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const sentenceNo = parseInt(searchParams.get("sentenceNo") || "");
  const courseId = searchParams.get("courseId");

  if (!sentenceNo || !courseId) {
    return NextResponse.json({ error: "sentenceNo와 courseId가 필요합니다." }, { status: 400 });
  }

  await prisma.myVoiceOpenList.deleteMany({
    where: { userId, courseId, sentenceNo },
  });

  return NextResponse.json({ success: true });
}
