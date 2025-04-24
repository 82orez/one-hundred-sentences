"use client";

import { useRecordingStore } from "@/stores/useRecordingStore";
import { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FaCheck, FaPlay, FaRegStopCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useAudioResources } from "@/hooks/useAudioResources";
import clsx from "clsx";
import { getMaskedSentence } from "@/utils/getMaskedSentence";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineFavorite } from "react-icons/md";
import { LuMousePointerClick } from "react-icons/lu";

interface Props {
  sentenceNo: number;
  sentenceEn: string;
  sentenceNativeAudioUrl: string;
  sentenceKo: string;
  isCompleted: boolean;
  isPlayingSentenceNo: number | null;

  playNativeAudio: (audioURL: string, sentenceNo: number) => void;
  handleComplete: (sentenceNo: number) => void;
  onClose: () => void;
  handleToggleFavorite: (sentenceNo: number) => void;
  isFavorite: { [key: number]: boolean };
}

const AudioRecorder = ({
  sentenceKo,
  sentenceEn,
  sentenceNo,
  handleComplete,
  onClose,
  isCompleted,
  isPlayingSentenceNo,
  playNativeAudio,
  sentenceNativeAudioUrl,
  handleToggleFavorite,
  isFavorite,
}: Props) => {
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
  const [showAnswer, setShowAnswer] = useState(false);

  const { requestMediaStream, createAudioContext, releaseAllResources } = useAudioResources();

  // 컴포넌트 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      releaseAllResources();
    };
  }, []);

  useEffect(() => {
    // ✅ 컴포넌트가 마운트될 때 자동으로 녹음 시작
    // const startRecordingAuto = async () => {
    //   await startRecording();
    // };
    //
    // startRecordingAuto();

    // 컴포넌트 언마운트 시 녹음 중지 및 모든 오디오 트랙 해제
    return () => {
      if (isRecording) {
        stopRecording();
      }

      // ✅ 모든 오디오 트랙 강제 종료 추가
      try {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
          })
          .catch((err) => console.error("마이크 해제 오류:", err));
      } catch (err) {
        console.error("마이크 해제 중 오류:", err);
      }
    };
  }, []);

  // ❌ 녹음 취소 및 창 닫기 함수
  const handleCancelRecording = async () => {
    if (isRecording) {
      await stopRecording(); // 녹음 즉시 중단
    }
    setAudioURL(null); // 녹음된 파일 삭제
    onClose(); // ✅ 모달창 닫기
    // ✅ 닫기 버튼 클릭 시에 강제로 새로고침 강제하기 -> mobile 환경에서 녹음 버튼 클릭 후에 speaking 연습/퀴즈 오류 방지 위해
    // window.location.reload();
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
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
      setHasNewRecording(true); // 새 녹음이 완료됨을 표시
      console.log("Audio URL:", audioURL);
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
        setRecordMessage(result.message);
        console.log(`File saved at: ${result.url}`);

        // 제출 후 새 녹음 상태 초기화
        setHasNewRecording(false);

        handleComplete(sentenceNo);
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

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setTimeout(() => setShowAnswer(false), 3000); // 지정한 시간 후에 숨기기 (1000 -> 1초)
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center">
      {/* 모달창을 fixed 포지셔닝으로 변경하고 스크롤 추가 */}
      <div className="relative max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-lg border bg-white px-4 py-8 shadow-lg">
        <div className="relative mt-5 flex w-full max-w-sm flex-col items-center rounded-lg border p-4">
          {/* ❌ 버튼 (닫기 & 녹음 취소) */}
          <button className="absolute -top-10 -right-2 text-red-500 hover:text-red-700" onClick={handleCancelRecording}>
            <IoMdCloseCircleOutline size={30} />
          </button>

          <p className="mt-1 text-center text-lg font-semibold text-gray-600 md:mt-4">문장을 녹음하고 원어민 발음과 비교해 보세요.</p>

          <div className={"mt-2 w-full rounded-lg border px-2 py-4"}>
            <div className={"mt-1 mb-4 flex w-full items-center justify-around"}>
              <div className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {sentenceNo}번 문장
              </div>
              <button className={"flex items-center justify-center gap-2"} onClick={() => handleToggleFavorite(sentenceNo)}>
                <div>
                  <GrFavorite size={25} className={clsx({ "text-gray-400": !isFavorite[sentenceNo] }, { hidden: isFavorite[sentenceNo] })} />
                  <MdOutlineFavorite size={25} className={clsx({ "text-yellow-400": isFavorite[sentenceNo] }, { hidden: !isFavorite[sentenceNo] })} />
                </div>
                <span className={""}>즐겨찾기</span>
              </button>
            </div>

            <p className={"mt-1 text-center text-xl font-semibold"}>{sentenceKo}</p>

            {/* 영어 문장 추가 */}
            {showAnswer ? (
              <p className="text-md mt-1 text-center text-lg font-semibold text-gray-700">{sentenceEn}</p>
            ) : (
              <p className="text-md mt-1 text-center text-lg font-semibold text-gray-700">
                {getMaskedSentence({ en: sentenceEn, ko: "", audioUrl: "", no: 0 })}
              </p>
            )}

            <div className={"flex w-full items-center justify-around"}>
              <div className="mt-4 flex w-full items-center justify-around">
                <button
                  className={clsx("h-9 min-w-9 cursor-pointer rounded", {
                    "opacity-50": isPlayingSentenceNo === sentenceNo || isRecording || isPlaying,
                  })}
                  onClick={() => playNativeAudio(sentenceNativeAudioUrl, sentenceNo)}
                  disabled={isPlayingSentenceNo !== null || isRecording || isPlaying} // 다른 문장이 재생 중이면 비활성화
                >
                  {isPlayingSentenceNo === sentenceNo ? (
                    <div className="btn btn-primary btn-soft flex items-center justify-center">
                      <AiOutlineLoading3Quarters className={"animate-spin"} /> 원어민 음성
                    </div>
                  ) : (
                    <div className={"btn btn-primary btn-soft flex items-center justify-center"}>
                      <FaPlay size={16} className={"mx-auto"} /> 원어민 음성
                    </div>
                  )}
                </button>

                <button onClick={handleShowAnswer} className={"btn btn-secondary btn-soft flex items-center justify-center"}>
                  <LuMousePointerClick size={24} />
                  정답 보기
                </button>
              </div>
            </div>
          </div>

          <p className={"mt-8 mb-4 text-lg font-semibold"}>Step 1. 문장 녹음하기</p>

          {/* ✅ 녹음 버튼 (오디오 재생 중이면 비활성화) */}
          <button
            onClick={isRecording ? handleStopRecording : startRecording}
            disabled={isPlaying || isPlayingSentenceNo !== null}
            className={`min-h-24 cursor-pointer rounded px-4 py-2 ${isRecording ? "animate-pulse text-red-500" : "text-gray-900"} ${isPlaying ? "cursor-not-allowed opacity-50" : ""}`}>
            {isRecording ? (
              <div className={"flex flex-col items-center justify-center"}>
                <FaRegStopCircle size={45} className={"mb-2"} />
                <p className={"text-xl font-semibold text-red-400"}>녹음 중, Click 하면 종료!</p>
              </div>
            ) : isLoading ? (
              <div className={"flex flex-col items-center justify-center"}>
                <AiOutlineLoading3Quarters className={"animate-spin text-gray-900"} />
                <p className={"mt-4 animate-pulse"}>준비 중</p>
              </div>
            ) : (
              <div className={"flex flex-col items-center justify-center"}>
                <FaMicrophone size={50} className={"mb-2"} />
                <p className={"text-xl font-semibold text-blue-400"}>Click 하면 녹음 시작!</p>
              </div>
            )}
          </button>

          {/* ✅ 오디오 재생 UI */}
          {audioURL && !isRecording && (
            <div className="mt-8 w-full">
              <p className={"mb-3 text-center text-lg font-semibold"}>Step 2. 내 발음 들어 보기</p>
              <audio
                ref={audioRef}
                controls
                src={audioURL}
                className="mx-auto w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
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
                disabled={isRecording || isLoading || isUpLoading || isPlaying || isPlayingSentenceNo !== null}>
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
          {uploadedURL && (
            <div className="mt-2 text-center text-lg">
              {/*<p className="text-green-600">{recordMessage}</p>*/}
              {recordCount !== null && <p>Speaking 연습 횟수: {recordCount} 회</p>}
              {/*<audio controls src={uploadedURL} className="mx-auto" />*/}
            </div>
          )}

          <button
            className="mt-8 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            onClick={handleCancelRecording}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
