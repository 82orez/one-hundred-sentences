import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Supabase 클라이언트 초기화
    const supabase = await createClient();
    console.log("Supabase client created successfully.");

    // Supabase 스토리지에서 파일 목록 가져오기
    const { data: files, error } = await supabase.storage.from("recordings").list();

    if (error) {
      console.error("Error fetching files:", error.message);
      return NextResponse.json({ error: `Error fetching files: ${error.message}` }, { status: 500 });
    }

    if (!files || files.length === 0) {
      console.log("No files to delete.");
      return NextResponse.json({ message: "No files to delete" }, { status: 200 });
    }

    const now = new Date();
    const filesToDelete: string[] = [];

    for (const file of files) {
      if (!file.created_at) continue;

      // ? 분 단위 차이 계산
      const fileDate = new Date(file.created_at);
      const diffMinutes = (now.getTime() - fileDate.getTime()) / (1000 * 60);

      // ! 원하는 시간 분단위로 설정 : 예)업로드된지 60분이 넘은 파일 삭제(1시간 이전 파일 삭제)
      if (diffMinutes > 10) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage.from("recordings").remove(filesToDelete);

      if (deleteError) {
        console.error("Error deleting files:", deleteError.message);
        return NextResponse.json({ error: `Error deleting files: ${deleteError.message}` }, { status: 500 });
      }

      console.log(`Deleted old files: ${filesToDelete.join(", ")}`);
      return NextResponse.json({ message: "Files deleted successfully", deletedFiles: filesToDelete }, { status: 200 });
    } else {
      console.log("No old files to delete.");
      return NextResponse.json({ message: "No old files to delete" }, { status: 200 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}

// 클라이언트에서 DELETE 요청 시 모든 파일 삭제
export async function DELETE(req: NextRequest) {
  try {
    // Supabase 클라이언트 초기화
    const supabase = await createClient();
    console.log("Supabase client created successfully.");

    // recordings 버킷에서 모든 파일 목록 가져오기
    const { data: files, error } = await supabase.storage.from("recordings").list();

    if (error) {
      console.error("Error fetching files:", error.message);
      return NextResponse.json({ error: `파일 목록을 가져오는데 실패했습니다: ${error.message}` }, { status: 500 });
    }

    if (!files || files.length === 0) {
      console.log("No files to delete.");
      return NextResponse.json({ message: "삭제할 파일이 없습니다" }, { status: 200 });
    }

    // 모든 파일 이름 배열 생성
    const filesToDelete = files.map((file) => file.name);

    // 모든 파일 삭제
    const { error: deleteError } = await supabase.storage.from("recordings").remove(filesToDelete);

    if (deleteError) {
      console.error("Error deleting files:", deleteError.message);
      return NextResponse.json({ message: "파일 삭제에 실패했습니다.", error: deleteError.message }, { status: 500 });
    }

    console.log(`Deleted all files: ${filesToDelete.join(", ")}`);
    return NextResponse.json(
      {
        message: "모든 파일이 성공적으로 삭제되었습니다.",
        deletedFiles: filesToDelete,
        count: filesToDelete.length,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "예상치 못한 오류가 발생했습니다" }, { status: 500 });
  }
}
