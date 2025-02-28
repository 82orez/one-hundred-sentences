"use client";

import axios from "axios";
import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 오래된 오디오 파일 삭제 요청
  const handleDeleteOldAudio = async () => {
    if (!window.confirm("정말 오래된 오디오 파일을 삭제하시겠습니까?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get("/api/delete-old-audio");

      if (response.status === 200) {
        setMessage(`성공: ${response.data.message}`);
      } else {
        setMessage(`실패: ${response.data.error || "알 수 없는 오류 발생"}`);
      }
    } catch (error) {
      console.error("Error deleting old audio:", error);
      setMessage("서버 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="text-lg font-bold">Admin Page</div>
      <button onClick={handleDeleteOldAudio} className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600" disabled={loading}>
        {loading ? "삭제 중..." : "오래된 오디오 파일 삭제"}
      </button>

      {message && <div className={`mt-4 rounded-md p-2 ${message.startsWith("성공") ? "bg-green-200" : "bg-red-200"}`}>{message}</div>}
    </div>
  );
}
