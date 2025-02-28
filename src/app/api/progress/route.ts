import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const completedSentences = await prisma.completedSentence.findMany();
  return NextResponse.json(completedSentences);
}
