"use client";

import { useRecordingStore } from "@/stores/useRecordingStore";
import { useState } from "react";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AudioRecorder = () => {
  const { isRecording, isLoading, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isUpLoading, setIsUpLoading] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      console.log("Audio URL:", audioURL);
    }
  };

  const handleSaveRecording = async () => {
    if (!audioURL) return;

    try {
      setIsUpLoading(true);

      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      const formData = new FormData();
      formData.append("audio", new File([audioBlob], "recording.mp3"));

      // Supabase 업로드 요청
      const uploadResponse = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.url) {
        setUploadedURL(result.url);
        setRecordCount(result.count);
        console.log(`File saved at: ${result.url}`);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while saving the recording.");
    } finally {
      setIsUpLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <p className={"mb-8"}>녹음한 파일을 다운 및 업로드하기</p>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`min-h-24 rounded px-4 py-2 ${isRecording ? "animate-pulse text-red-500" : "text-gray-900"}`}>
        {isRecording ? (
          <div>
            <FaRegStopCircle size={45} className={"mb-2"} />
            <p className={"text-xl font-semibold text-red-400"}>Stop</p>
          </div>
        ) : isLoading ? (
          <div className={"flex flex-col items-center justify-center"}>
            <AiOutlineLoading3Quarters className={"animate-spin text-gray-900"} />
            <p className={"mt-4 animate-pulse"}>준비 중</p>
          </div>
        ) : (
          <div className={"flex flex-col items-center justify-center"}>
            <FaMicrophone size={50} className={"mb-2"} />
            <p className={"text-xl font-semibold"}>Start</p>
          </div>
        )}
      </button>

      {audioURL && (
        <div className="mt-4 mb-10">
          <p className={"mt-10 mb-3 text-center"}>녹음한 내용 듣기</p>
          <audio controls src={audioURL} className="mx-auto" />
        </div>
      )}

      {audioURL && (
        <button
          onClick={handleSaveRecording}
          className="mt-4 flex min-h-12 w-1/4 min-w-52 items-center justify-center rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
          disabled={isRecording || isLoading || isUpLoading}>
          {isUpLoading ? <AiOutlineLoading3Quarters className="animate-spin text-xl" /> : <div className={""}>Save Recording to Server</div>}
        </button>
      )}

      {uploadedURL && (
        <div className="mt-4 text-center">
          <p className="text-green-600">File saved successfully!</p>
          {recordCount !== null && <p>오늘 저장한 파일 개수: {recordCount}개</p>}
        </div>
      )}

      <Link href={"/"} className="mt-10 text-blue-500 hover:underline">
        Back to Home
      </Link>
    </div>
  );
};

export default AudioRecorder;
