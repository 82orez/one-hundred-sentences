import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "토큰과 비밀번호가 필요합니다." }, { status: 400 });
    }

    // 🔹 token 으로 비밀번호 재설정 정보를 찾음 (findFirst 사용)
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ message: "유효하지 않거나 만료된 링크입니다." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // 🔹 사용자 비밀번호 업데이트
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // 🔹 사용된 비밀번호 재설정 토큰 삭제
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }, // 🔹 `id` 값을 기준으로 삭제해야 함
    });

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다." });
  } catch (error) {
    return NextResponse.json({ message: "비밀번호 변경에 실패했습니다." }, { status: 500 });
  }
}
