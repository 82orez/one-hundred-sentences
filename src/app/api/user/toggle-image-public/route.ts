import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isImagePublicOpen: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 현재 값의 반대로 토글
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { isImagePublicOpen: !user.isImagePublicOpen },
    });

    return NextResponse.json({ isImagePublicOpen: updatedUser.isImagePublicOpen });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle image public status" }, { status: 500 });
  }
}
