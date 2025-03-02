import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const completedSentences = await prisma.completedSentence.findMany({
      where: { userId },
      include: { sentence: true },
    });
    console.log("completedSentences: ", completedSentences);

    return NextResponse.json(completedSentences);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 });
  }
}

// 이제 API가 다음과 같은 JSON 응답을 반환
// [
//   {
//     "id": "clxyz123",
//     "userId": "clabc456",
//     "sentenceId": 3,
//     "completedAt": "2025-02-26T12:00:00.000Z",
//     "sentence": {
//       "id": 3,
//       "no": 3,
//       "en": "How many bags can I check in?",
//       "ko": "부칠 수 있는 가방은 몇 개인가요?"
//     }
//   }
// ]
