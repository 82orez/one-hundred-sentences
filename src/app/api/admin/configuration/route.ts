// src/app/api/admin/configuration/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 현재 설정 정보 가져오기
export async function GET() {
  try {
    // 첫 번째 레코드 가져오기 (설정은 하나만 유지)
    const config = await prisma.configuration.findFirst();

    return NextResponse.json(config || {});
  } catch (error) {
    console.error("설정 정보를 가져오는 중 오류 발생:", error);
    return NextResponse.json({ error: "설정 정보를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 설정 정보 저장 또는 업데이트
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { siteName, adminEmail, adminId } = data;

    // 필수 입력값 확인
    if (!siteName || !adminEmail || !adminId) {
      return NextResponse.json({ error: "사이트 이름, 관리자 이메일, 관리자 ID는 필수 입력값입니다." }, { status: 400 });
    }

    // 기존 설정 확인
    const existingConfig = await prisma.configuration.findFirst();

    let config;

    if (existingConfig) {
      // 기존 설정이 있으면 업데이트
      config = await prisma.configuration.update({
        where: { id: existingConfig.id },
        data: { siteName, adminEmail, adminId },
      });
    } else {
      // 기존 설정이 없으면 새로 생성
      config = await prisma.configuration.create({
        data: { siteName, adminEmail, adminId },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("설정 정보를 저장하는 중 오류 발생:", error);
    return NextResponse.json({ error: "설정 정보를 저장하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
