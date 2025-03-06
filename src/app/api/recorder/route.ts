import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const sentenceNo = formData.get("sentenceNo") as string; // ✅ sentenceNo 가져오기

    if (!audioFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!sentenceNo) {
      return NextResponse.json({ error: "Sentence number is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `recordings/${user.id}/sentence-${sentenceNo}-${Date.now()}.mp3`;

    const { error } = await supabase.storage.from("recordings").upload(fileName, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (error) {
      console.error("Upload Error:", error.message);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    // 업로드된 파일의 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from("recordings").getPublicUrl(fileName);
    const fileUrl = publicUrlData.publicUrl;

    // ✅ Prisma DB에 저장
    await prisma.recordings.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        sentenceNo: parseInt(sentenceNo, 10), // ✅ sentenceNo 저장
        fileUrl,
      },
    });

    // ✅ 오늘 저장한 파일 개수 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.recordings.count({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      count,
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
