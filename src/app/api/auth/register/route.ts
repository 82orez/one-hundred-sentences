import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { emailSignUpIndicator } from "@/lib/emailSignUpIndicator";

export async function POST(req: Request) {
  console.log("Incoming request...");
  const body = await req.json();

  try {
    console.log("Parsing request body...");
    console.log("Parsed body:", body);

    const { email, password } = body;

    if (!email || !password) {
      console.log("Validation failed: Missing email or password");
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    console.log("Checking for existing user...");
    const existingUser = await prisma.user.findUnique({ where: { email: email } });
    if (existingUser) {
      console.log("User already exists.");
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 });
    }

    console.log("Hashing password...");
    const hashedPassword = await hash(password, 10);

    console.log("Creating user in database...");
    console.log("Creating user with data:", {
      email,
      password: hashedPassword,
    });

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        // * 소셜 로그인과 구분하기 위한 name 필드에 문자열을 입력하고 credentials 필드에 true 를 입력함.
        name: emailSignUpIndicator,
        credentials: true,
      },
    });

    console.log("User created successfully:", user);

    return NextResponse.json({ message: "회원 가입에 성공하셨습니다.", user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error.", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
