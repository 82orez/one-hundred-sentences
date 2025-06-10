// app/api/voice/listened/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { voiceId } = await req.json();
  if (!voiceId) {
    return NextResponse.json({ error: "음성 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const result = await prisma.voiceListened.upsert({
      where: {
        userId_myVoiceOpenListId: {
          userId: session.user.id,
          myVoiceOpenListId: voiceId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        myVoiceOpenListId: voiceId,
      },
    });

    return NextResponse.json({
      listened: true,
      firstTime: result.createdAt.getTime() === result.updatedAt.getTime(), // 처음 들었는지 여부
    });
  } catch (error) {
    console.error("음성 파일 청취 기록 중 오류 발생:", error);
    return NextResponse.json({ error: "음성 파일 청취 기록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// GET 요청으로 특정 음성 파일의 청취 여부 확인
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(req.url);
  const voiceId = url.searchParams.get("voiceId");

  if (!voiceId) {
    return NextResponse.json({ error: "음성 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const record = await prisma.voiceListened.findUnique({
      where: {
        userId_myVoiceOpenListId: {
          userId: session.user.id,
          myVoiceOpenListId: voiceId,
        },
      },
    });

    return NextResponse.json({ listened: !!record });
  } catch (error) {
    console.error("음성 파일 청취 여부 확인 중 오류 발생:", error);
    return NextResponse.json({ error: "음성 파일 청취 여부 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
