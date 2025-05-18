import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 즐겨찾기 조회
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다" }, { status: 400 });
    }

    // 즐겨찾기 문장 조회 및 문장 정보 함께 가져오기
    const favorites = await prisma.favoriteSentence.findMany({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
      include: {
        sentence: true, // 문장 정보도 가져옴
      },
      orderBy: {
        createdAt: "desc", // 최신순 정렬
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("즐겨찾기 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

// 즐겨찾기 삭제
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sentenceNo = searchParams.get("sentenceNo");
    const courseId = searchParams.get("courseId");

    if (!sentenceNo) {
      return NextResponse.json({ error: "문장 번호가 필요합니다" }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다" }, { status: 400 });
    }

    // 사용자의 해당 즐겨찾기 찾기
    const favorite = await prisma.favoriteSentence.findFirst({
      where: {
        userId: session.user.id,
        sentenceNo: Number(sentenceNo),
        courseId: courseId,
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: "즐겨찾기를 찾을 수 없습니다" }, { status: 404 });
    }

    // 즐겨찾기 삭제
    await prisma.favoriteSentence.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ message: "즐겨찾기가 삭제되었습니다" });
  } catch (error) {
    console.error("즐겨찾기 삭제 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
