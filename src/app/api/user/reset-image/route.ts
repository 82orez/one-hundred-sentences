// app/api/user/reset-image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 현재 사용자 정보를 가져옵니다
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { customImageUrl: true },
    });

    // 사용자가 커스텀 이미지를 가지고 있는지 확인합니다
    if (user?.customImageUrl) {
      // customImageUrl 에서 파일 이름 추출
      const fileUrl = user.customImageUrl;
      const fileName = fileUrl.split("/").pop();

      if (fileName) {
        // Supabase 클라이언트 생성
        const supabase = await createClient();

        // Supabase Storage 에서 파일 삭제
        const { error } = await supabase.storage.from("profile-images").remove([fileName]);

        if (error) {
          console.error("Supabase 파일 삭제 중 오류:", error);
          // 파일 삭제에 실패해도 DB 업데이트는 진행합니다
        }
      }
    }

    // customImageUrl 필드를 null로 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { customImageUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("이미지 초기화 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
