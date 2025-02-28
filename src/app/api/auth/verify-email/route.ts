import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // 이메일이 user 테이블에 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { credentials: true },
    });

    if (existingUser) {
      if (existingUser.credentials) {
        return NextResponse.json({ message: "이미 가입된 Email 입니다." }, { status: 400 });
      } else {
        return NextResponse.json({ message: "Kakao 로그인 사용자입니다." }, { status: 400 });
      }
    }

    // 랜덤 6자리 숫자 생성
    const token = crypto.randomInt(100000, 999999).toString();

    // 기존 이메일 인증 코드 삭제
    await prisma.emailVerificationToken.deleteMany({
      where: { email },
    });

    // 새로운 인증 코드 저장 (5분 후 만료)
    await prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const data = await resend.emails.send({
      from: "Your Service Name <no-reply@supaneer.com>",
      to: email,
      subject: "Your verification code",
      text: `Your verification code is: ${token}`,
    });

    return NextResponse.json({ message: "인증코드가 발송되었습니다." });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ message: "Failed to send verification code." }, { status: 500 });
  }
}
