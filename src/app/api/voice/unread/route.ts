// src/app/api/voice/unread/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lastChecked = searchParams.get('lastChecked');

    if (!courseId) {
      return NextResponse.json({ error: '강좌 ID가 필요합니다.' }, { status: 400 });
    }

    // 마지막 확인 시간 이후에 추가된 다른 사용자의 음성 파일 개수 조회
    const query: any = {
      courseId: courseId,
      userId: { not: session.user.id }, // 자신이 업로드한 것 제외
    };

    // 마지막 확인 시간이 있으면 필터 추가
    if (lastChecked) {
      query.createdAt = { gt: new Date(lastChecked) };
    }

    const count = await prisma.myVoiceOpenList.count({
      where: query,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('미확인 음성 파일 개수 조회 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}