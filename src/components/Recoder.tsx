"use client";

import { useRecordingStore } from "@/stores/useRecordingStore";
import { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FaCheck, FaRegStopCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";

interface Props {
  sentenceNo: number;
  sentenceEn: string;
  sentenceKo: string;
  isCompleted: boolean;

  handleComplete: (sentenceNo: number) => void;
  onClose: () => void;
}

const AudioRecorder = ({ sentenceKo, sentenceEn, sentenceNo, handleComplete, onClose, isCompleted }: Props) => {
  const { isRecording, isLoading, startRecording, stopRecording } = useRecordingStore();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isUpLoading, setIsUpLoading] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 참조 추가
  const [hasNewRecording, setHasNewRecording] = useState(false);
  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ 컴포넌트가 마운트될 때 자동으로 녹음 시작 (약간의 지연 추가)
  useEffect(() => {
    // 약간의 지연을 두고 녹음 시작 (모바일 환경에서 더 안정적)
    autoStartTimeoutRef.current = setTimeout(async () => {
      try {
        await startRecording();
      } catch (error) {
        console.error("자동 녹음 시작 실패:", error);
        setRecordingError("녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요.");
      }
    }, 500);

    // ✅ 컴포넌트 언마운트 시 녹음 중지 및 타이머 정리
    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }

      if (isRecording) {
        stopRecording().catch((err) => console.error("녹음 중지 오류:", err));
      }

      // URL.revokeObjectURL로 메모리 누수 방지
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, []); // ✅ 의존성 배열이 비어있어 컴포넌트 마운트 시 한 번만 실행됨

  // ❌ 녹음 취소 및 창 닫기 함수
  const handleCancelRecording = async () => {
    try {
      if (isRecording) {
        await stopRecording(); // ✅ 녹음 즉시 중단
      }

      // URL.revokeObjectURL로 메모리 누수 방지
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }

      onClose(); // ✅ 모달창 닫기
    } catch (error) {
      console.error("녹음 취소 처리 중 오류:", error);
      onClose(); // 오류가 발생해도 모달은 닫음
    }
  };

  // ✅ 녹음 시작 시 타이머 설정 및 녹음 종료 시 타이머 제거
  useEffect(() => {
    if (isRecording) {
      // 녹음 시작 시 1분(60000ms) 타이머 설정
      timerRef.current = setTimeout(() => {
        handleCancelRecording();
      }, 60000);
    } else {
      // 녹음이 중지되면 타이머 제거
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleStopRecording = async () => {
    setRecordingError(null);
    try {
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        // 이전 URL이 있으면 해제
        if (audioURL) {
          URL.revokeObjectURL(audioURL);
        }

        const newAudioURL = URL.createObjectURL(audioBlob);
        setAudioURL(newAudioURL);
        setHasNewRecording(true);
        console.log("Audio URL:", newAudioURL, "Blob 크기:", audioBlob.size);
      } else {
        console.warn("유효한 오디오 데이터가 없습니다.");
        setRecordingError("녹음된 오디오가 없습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("녹음 중지 중 오류:", error);
      setRecordingError("녹음 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleSaveRecording = async () => {
    if (!audioURL || !hasNewRecording) {
      alert("새로운 녹음이 필요합니다. 녹음 후 다시 시도해주세요.");
      return;
    }

    // 확인창 추가
    const confirmSubmit = window.confirm("정말로 제출하시겠습니까?");
    if (!confirmSubmit) return; // 사용자가 취소하면 제출 중단

    try {
      setIsUpLoading(true);

      const response = await fetch(audioURL);
      const audioBlob = await response.blob();

      if (audioBlob.size === 0) {
        throw new Error("녹음된 오디오 데이터가 없습니다.");
      }

      const formData = new FormData();
      formData.append("audio", new File([audioBlob], `recording-${sentenceNo}.mp3`));
      formData.append("sentenceNo", sentenceNo.toString());

      const uploadResponse = await fetch("/api/recorder", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("서버 응답이 올바르지 않습니다: " + uploadResponse.status);
      }

      const result = await uploadResponse.json();
      if (result.url) {
        setUploadedURL(result.url);
        setRecordCount(result.count);
        setRecordMessage(result.message);
        console.log(`File saved at: ${result.url}`);

        // 제출 후 새 녹음 상태 초기화
        setHasNewRecording(false);

        // 핵심! 상위 컴포넌트에 완료 알림
        handleComplete(sentenceNo);
      } else {
        alert(result.error || "업로드 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("녹음 파일 저장 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : "알 수 없는 오류"));
    } finally {
      setIsUpLoading(false);
    }
  };

  return (
    <div className="relative mt-5 flex w-full max-w-sm flex-col items-center rounded-lg border p-4">
      {/* ❌ 버튼 (닫기 & 녹음 취소) */}
      <button className="absolute -top-9 -right-5 text-red-500 hover:text-red-700" onClick={handleCancelRecording}>
        <IoMdCloseCircleOutline size={30} />
      </button>

      <p className={"mt-1 text-center text-lg"}>{sentenceKo}</p>

      {/* 영어 문장 추가 */}
      <p className="text-md mt-1 text-center text-gray-700">{sentenceEn}</p>

      {recordingError && <div className="mt-2 text-center text-red-500">{recordingError}</div>}

      <p className={"mt-8 mb-4 text-lg font-semibold"}>Step 1. 문장 녹음하기</p>

      {/* ✅ 녹음 버튼 (오디오 재생 중이면 비활성화) */}
      <button
        onClick={isRecording ? handleStopRecording : startRecording}
        disabled={isPlaying}
        className={`min-h-24 cursor-pointer rounded px-4 py-2 ${isRecording ? "animate-pulse text-red-500" : "text-gray-900"} ${isPlaying ? "cursor-not-allowed opacity-50" : ""}`}>
        {isRecording ? (
          <div className={"flex flex-col items-center justify-center"}>
            <FaRegStopCircle size={45} className={"mb-2"} />
            <p className={"text-xl font-semibold text-red-400"}>녹음 완료하기</p>
          </div>
        ) : isLoading ? (
          <div className={"flex flex-col items-center justify-center"}>
            <AiOutlineLoading3Quarters className={"animate-spin text-gray-900"} />
            <p className={"mt-4 animate-pulse"}>준비 중</p>
          </div>
        ) : (
          <div className={"flex flex-col items-center justify-center"}>
            <FaMicrophone size={50} className={"mb-2"} />
            <p className={"animate-pulse text-xl font-semibold text-red-400"}>Click</p>
          </div>
        )}
      </button>

      {/* ✅ 오디오 재생 UI */}
      {audioURL && !isRecording && (
        <div className="mt-8 w-full">
          <p className={"mb-3 text-center text-lg font-semibold"}>Step 2. 녹음 파일 들어 보기</p>
          <audio
            ref={audioRef}
            controls
            src={audioURL}
            className="mx-auto w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              console.error("오디오 재생 오류:", e);
              setRecordingError("오디오 재생 중 오류가 발생했습니다. 다시 녹음해주세요.");
            }}
          />
        </div>
      )}

      {/* ✅ 녹음 파일 제출 */}
      {audioURL && !isRecording && (
        <div className="mt-8 mb-2 flex flex-col items-center">
          <p className={"text-center text-lg font-semibold"}>Step 3. 녹음 파일 제출하기</p>
          <button
            onClick={handleSaveRecording}
            className="mt-2 flex min-h-12 w-1/4 min-w-52 cursor-pointer items-center justify-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={isRecording || isLoading || isUpLoading || isPlaying}>
            {isUpLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            ) : isCompleted ? (
              <div className={"flex items-center justify-center gap-2"}>
                <FaCheck size={20} />
                다시 제출
              </div>
            ) : (
              "녹음 파일 제출"
            )}
          </button>
        </div>
      )}

      {/* ✅ 업로드 완료 시 메시지 표시 */}
      {uploadedURL && <div className="mt-2 text-center text-lg">{recordCount !== null && <p>Speaking 연습 횟수: {recordCount} 회</p>}</div>}
    </div>
  );
};

export default AudioRecorder;
