import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ message: "Email and token are required." }, { status: 400 });
    }

    // 인증 코드 확인
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { email },
    });

    // if (!verificationToken || verificationToken.token !== token) {
    //   return NextResponse.json({ message: "잘못된 인증코드입니다." }, { status: 400 });
    // }

    if (!verificationToken) {
      return NextResponse.json({ message: "인증코드가 없습니다." }, { status: 400 });
    } else if (verificationToken.expires < new Date()) {
      return NextResponse.json({ message: "더 이상 유효하지 않거나 만료된 인증코드입니다." }, { status: 400 });
    } else if (verificationToken.token !== token) {
      return NextResponse.json({ message: "잘못된 인증코드입니다." }, { status: 400 });
    }

    // 인증 성공 시, 인증 코드 삭제
    await prisma.emailVerificationToken.delete({
      where: { email },
    });

    return NextResponse.json({ message: "인증에 성공하였습니다." });
  } catch (error) {
    console.error("Code validation error:", error);
    return NextResponse.json({ message: "Failed to validate code." }, { status: 500 });
  }
}
