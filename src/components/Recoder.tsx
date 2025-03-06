"use client";

import { useRecordingStore } from "@/stores/useRecordingStore";
import { useState } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiCloseLargeFill } from "react-icons/ri";

interface Props {
  sentenceNo: number;
  handleComplete: (sentenceNo: number) => void;
  onClose: () => void; // ✅ 추가: 녹음 UI 닫기 함수
}

const AudioRecorder = ({ sentenceNo, handleComplete, onClose }: Props) => {
  const { isRecording, isLoading, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isUpLoading, setIsUpLoading] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // ✅ 추가: 숙제 제출 완료 상태

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
      formData.append("audio", new File([audioBlob], `recording-${sentenceNo}.mp3`)); // ✅ 파일 이름에 sentenceNo 추가
      formData.append("sentenceNo", sentenceNo.toString()); // ✅ sentenceNo 추가

      // Supabase 업로드 요청
      const uploadResponse = await fetch("/api/recorder", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.url) {
        setUploadedURL(result.url);
        setRecordCount(result.count);
        console.log(`File saved at: ${result.url}`);

        // ✅ 녹음 파일 제출 후 문장 완료 처리
        handleComplete(sentenceNo);

        // ✅ 숙제 제출 완료 상태로 변경
        setIsSubmitted(true);
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
    <div className="relative mt-4 flex w-full max-w-sm flex-col items-center rounded-lg border p-4">
      {/* ✅ X 버튼 (우측 상단) */}
      <button className="absolute top-3 right-3 text-red-500 hover:text-red-700" onClick={onClose}>
        <RiCloseLargeFill size={24} />
      </button>

      <p className={"mb-4 text-lg"}>Step 1. 문장 녹음하기</p>

      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        className={`min-h-24 cursor-pointer rounded px-4 py-2 ${isRecording ? "animate-pulse text-red-500" : "text-gray-900"}`}>
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
            <p className={"animate-pulse text-xl font-semibold text-red-400"}>Start</p>
          </div>
        )}
      </button>

      {audioURL && (
        <div className="mt-8">
          <p className={"mb-3 text-center text-lg"}>Step 2. 녹음한 내 발음 들어 보기</p>
          <audio controls src={audioURL} className="mx-auto" />
        </div>
      )}

      {audioURL && (
        <div className="mt-8 flex flex-col items-center">
          <p className={"text-center text-lg"}>Step 3. 녹음한 파일 제출하기</p>
          <button
            onClick={handleSaveRecording}
            className="mt-2 flex min-h-12 w-1/4 min-w-52 cursor-pointer items-center justify-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={isRecording || isLoading || isUpLoading || isSubmitted}>
            {isUpLoading ? <AiOutlineLoading3Quarters className="animate-spin text-xl" /> : isSubmitted ? "숙제 제출 완료" : "녹음 파일 제출"}
          </button>
        </div>
      )}

      {uploadedURL && (
        <div className="mt-4 text-center">
          <p className="text-green-600">File saved successfully!</p>
          {recordCount !== null && <p>오늘 저장한 파일 개수: {recordCount}개</p>}
          <audio controls src={uploadedURL} className="mx-auto" />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
