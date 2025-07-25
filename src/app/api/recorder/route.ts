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
    const courseId = formData.get("courseId") as string;
    const sentenceNo = formData.get("sentenceNo") as string;

    if (!audioFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }
    if (!sentenceNo) {
      return NextResponse.json({ error: "Sentence number is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `recordings/${courseId}/${user.id}/sentence-${sentenceNo}-${Date.now()}.mp3`;

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
    // 이미 해당 사용자와 문장에 대한 녹음이 있는지 확인
    const existingRecording = await prisma.recordings.findFirst({
      where: {
        userId: user.id,
        courseId,
        sentenceNo: parseInt(sentenceNo, 10),
      },
    });

    if (existingRecording) {
      // 기존 녹음 업데이트
      await prisma.recordings.update({
        where: { id: existingRecording.id },
        data: { fileUrl, attemptCount: existingRecording.attemptCount + 1 },
      });
    } else {
      // 새 녹음 생성
      await prisma.recordings.create({
        data: {
          userId: user.id,
          courseId,
          sentenceNo: parseInt(sentenceNo, 10),
          fileUrl,
          attemptCount: 1,
        },
      });
    }

    const count = await prisma.recordings.findFirst({
      where: {
        userId: user.id,
        courseId,
        sentenceNo: parseInt(sentenceNo, 10),
      },
    });

    // 녹음 파일 저장 후 추가 작업
    // 사용자가 이 문장에 대해 목소리를 공개했는지 확인
    const existingVoicePublic = await prisma.myVoiceOpenList.findFirst({
      where: {
        userId: user.id,
        courseId,
        sentenceNo: parseInt(sentenceNo, 10),
      },
    });

    // 이미 공개 설정된 경우, myVoiceUrl 업데이트
    if (existingVoicePublic) {
      await prisma.myVoiceOpenList.update({
        where: { id: existingVoicePublic.id },
        data: { myVoiceUrl: fileUrl }, // 새로 녹음된 파일 URL로 업데이트
      });
    }

    return NextResponse.json({
      message: existingRecording ? "Recording updated successfully" : "New recording created successfully",
      url: fileUrl,
      count: count.attemptCount,
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
