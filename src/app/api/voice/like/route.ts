// app/api/voice/like/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 검증
    if (!session?.user) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    const { voiceId } = await request.json();

    if (!voiceId) {
      return NextResponse.json({ error: "음성 파일 ID가 필요합니다." }, { status: 400 });
    }

    const userId = session.user.id;

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.voiceLike.findUnique({
      where: {
        userId_myVoiceOpenListId: {
          userId,
          myVoiceOpenListId: voiceId,
        },
      },
    });

    if (existingLike) {
      // 이미 좋아요가 있으면 삭제 (좋아요 취소)
      await prisma.$transaction([
        // 좋아요 삭제
        prisma.voiceLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        // 좋아요 카운트 감소
        prisma.myVoiceOpenList.update({
          where: { id: voiceId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return NextResponse.json({
        liked: false,
        message: "좋아요가 취소되었습니다.",
      });
    } else {
      // 좋아요가 없으면 추가
      await prisma.$transaction([
        // 좋아요 추가
        prisma.voiceLike.create({
          data: {
            userId,
            myVoiceOpenListId: voiceId,
          },
        }),
        // 좋아요 카운트 증가
        prisma.myVoiceOpenList.update({
          where: { id: voiceId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return NextResponse.json({
        liked: true,
        message: "좋아요가 추가되었습니다.",
      });
    }
  } catch (error) {
    console.error("좋아요 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 현재 사용자가 좋아요를 눌렀는지 확인하는 API
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 검증
    if (!session?.user) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const voiceId = searchParams.get("voiceId");

    if (!voiceId) {
      return NextResponse.json({ error: "음성 파일 ID가 필요합니다." }, { status: 400 });
    }

    const userId = session.user.id;

    // 사용자가 특정 음성 파일에 좋아요를 눌렀는지 확인
    const existingLike = await prisma.voiceLike.findUnique({
      where: {
        userId_myVoiceOpenListId: {
          userId,
          myVoiceOpenListId: voiceId,
        },
      },
    });

    return NextResponse.json({
      liked: !!existingLike,
    });
  } catch (error) {
    console.error("좋아요 상태 확인 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
