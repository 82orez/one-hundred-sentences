"use client";

import { useRecordingStore } from "@/stores/useRecordingStore";
import { useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiCloseLargeFill } from "react-icons/ri";

interface Props {
  sentenceKo: string;
  sentenceNo: number;
  handleComplete: (sentenceNo: number) => void;
  onClose: () => void;
}

const AudioRecorder = ({ sentenceKo, sentenceNo, handleComplete, onClose }: Props) => {
  const { isRecording, isLoading, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isUpLoading, setIsUpLoading] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ❌ 녹음 취소 및 창 닫기 함수
  const handleCancelRecording = async () => {
    if (isRecording) {
      await stopRecording(); // ✅ 녹음 즉시 중단
    }
    setAudioURL(null); // ✅ 녹음된 파일 삭제
    onClose(); // ✅ 모달창 닫기
  };

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

    // ✅ 확인창 추가
    const confirmSubmit = window.confirm("정말로 제출하시겠습니까?");
    if (!confirmSubmit) return; // 사용자가 취소하면 제출 중단

    try {
      setIsUpLoading(true);

      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      const formData = new FormData();
      formData.append("audio", new File([audioBlob], `recording-${sentenceNo}.mp3`));
      formData.append("sentenceNo", sentenceNo.toString());

      const uploadResponse = await fetch("/api/recorder", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.url) {
        setUploadedURL(result.url);
        setRecordCount(result.count);
        console.log(`File saved at: ${result.url}`);

        handleComplete(sentenceNo);
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
      {/* ❌ 버튼 (닫기 & 녹음 취소) */}
      <button className="absolute top-3 right-3 text-red-500 hover:text-red-700" onClick={handleCancelRecording}>
        <RiCloseLargeFill size={24} />
      </button>

      <p>{sentenceKo}</p>

      <p className={"mb-4 text-lg font-semibold"}>Step 1. 문장 녹음하기</p>

      {/* ✅ 녹음 버튼 (오디오 재생 중이면 비활성화) */}
      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        disabled={isPlaying}
        className={`min-h-24 cursor-pointer rounded px-4 py-2 ${isRecording ? "animate-pulse text-red-500" : "text-gray-900"} ${isPlaying ? "cursor-not-allowed opacity-50" : ""}`}>
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

      {/* ✅ 오디오 재생 UI */}
      {audioURL && !isRecording && (
        <div className="mt-8">
          <p className={"mb-3 text-center text-lg font-semibold"}>Step 2. 녹음한 내 발음 들어 보기</p>
          <audio
            ref={audioRef}
            controls
            src={audioURL}
            className="mx-auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* ✅ 녹음 파일 제출 */}
      {audioURL && !isRecording && (
        <div className="mt-8 flex flex-col items-center">
          <p className={"text-center text-lg font-semibold"}>Step 3. 녹음한 파일 제출하기</p>
          <button
            onClick={handleSaveRecording}
            className="mt-2 flex min-h-12 w-1/4 min-w-52 cursor-pointer items-center justify-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={isRecording || isLoading || isUpLoading || isSubmitted || isPlaying}>
            {isUpLoading ? <AiOutlineLoading3Quarters className="animate-spin text-xl" /> : isSubmitted ? "숙제 제출 완료" : "녹음 파일 제출"}
          </button>
        </div>
      )}

      {/* ✅ 업로드 완료 시 메시지 표시 */}
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
