import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: NextRequest) {
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

    // 모든 파일 이름을 삭제 목록에 추가
    const filesToDelete = files.map((file) => file.name);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage.from("recordings").remove(filesToDelete);

      if (deleteError) {
        console.error("Error deleting files:", deleteError.message);
        return NextResponse.json({ error: `Error deleting files: ${deleteError.message}` }, { status: 500 });
      }

      console.log(`Deleted all files: ${filesToDelete.join(", ")}`);
      return NextResponse.json({ message: "All files deleted successfully", deletedFiles: filesToDelete }, { status: 200 });
    } else {
      console.log("No files to delete.");
      return NextResponse.json({ message: "No files to delete" }, { status: 200 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
