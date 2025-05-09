// src/app/api/user/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// Supabase 클라이언트 초기화

export async function POST(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
    }

    const supabase = await createClient();

    // 폼 데이터에서 파일 가져오기
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 제공되지 않았습니다." }, { status: 400 });
    }

    // 파일 타입 및 크기 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    // 파일 확장자 추출
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    // 파일 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage.from("profile-images").upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("Storage error:", error);
      return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(fileName);

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { customImageUrl: publicUrl },
    });

    return NextResponse.json({ success: true, imageUrl: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
