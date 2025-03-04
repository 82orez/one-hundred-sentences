"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";

const DictationQuizPage = () => {
  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; audioUrl: string } | null>(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ 완료된 문장 목록 가져오기 (API 응답 구조 수정)
  const { data: completedSentences, isLoading } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
        console.log("🔹 API 응답 데이터:", res.data); // ✅ API 응답 확인

        return res.data.map((item: { sentence: { en: string; audioUrl: string } }) => ({
          en: item.sentence?.en ?? "No text found",
          audioUrl: item.sentence?.audioUrl ?? "No audio found",
        }));
      } catch (error) {
        console.error("❌ API 호출 오류:", error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // ✅ 랜덤 문장 선택
  useEffect(() => {
    if (completedSentences && completedSentences.length > 0) {
      selectRandomSentence();
    }
  }, [completedSentences]);

  const selectRandomSentence = () => {
    if (!completedSentences || completedSentences.length === 0) return;
    const randomIndex = Math.floor(Math.random() * completedSentences.length);
    const selected = completedSentences[randomIndex];

    console.log("🔹 선택된 문장:", selected); // ✅ 선택된 문장 확인
    setCurrentSentence(selected);
    setUserInput("");
    setFeedback(null);
  };

  // ✅ 정답 확인
  const checkAnswer = () => {
    if (!currentSentence) return;
    if (userInput.trim().toLowerCase() === currentSentence.en.toLowerCase()) {
      setFeedback("✅ 맞았습니다!");
    } else {
      setFeedback("❌ 다시 도전하세요.");
    }
  };

  // ✅ 음성 파일 재생
  const playAudio = async () => {
    if (!currentSentence?.audioUrl || currentSentence.audioUrl === "No audio found") {
      console.warn("⚠️ 오디오 URL이 없습니다.");
      return;
    }

    try {
      console.log("🎵 오디오 재생 시도:", currentSentence.audioUrl);
      const audio = new Audio(currentSentence.audioUrl);
      audio.volume = 1.0;

      audio.onplay = () => console.log("▶️ 오디오 재생 시작");
      audio.onended = () => {
        console.log("⏹️ 오디오 재생 완료");
        setIsPlaying(false);
      };
      audio.onerror = (err) => console.error("❌ 오디오 재생 오류", err);

      setIsPlaying(true);
      await audio.play();
    } catch (error) {
      console.error("❌ 오디오 재생 중 오류 발생:", error);
      setIsPlaying(false);
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-500">문장을 불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-3xl font-bold">받아쓰기 퀴즈</h1>
      <p className="mt-2 text-lg text-gray-600">문장을 듣고 받아쓰기를 해보세요.</p>

      {currentSentence ? (
        <div className="mt-6">
          {/* ✅ 음성 재생 버튼 */}
          <button
            className={clsx(
              "rounded-lg px-6 py-3 text-lg font-bold shadow-lg transition",
              isPlaying ? "cursor-not-allowed bg-gray-400 text-white" : "bg-blue-500 text-white hover:bg-blue-600",
            )}
            onClick={playAudio}
            disabled={isPlaying}>
            {isPlaying ? "재생 중..." : "문장 듣기 🎧"}
          </button>

          {/* ✅ 입력 필드 */}
          <input
            type="text"
            className="mt-4 w-full rounded-lg border p-3 text-center text-lg"
            placeholder="문장을 입력하세요..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          {/* ✅ 정답 확인 버튼 */}
          <button
            className="mt-4 w-full rounded-lg bg-green-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600"
            onClick={checkAnswer}>
            정답 제출 🚀
          </button>

          {/* ✅ 정답 피드백 */}
          {feedback && <p className={clsx("mt-4 text-lg font-semibold", feedback.includes("✅") ? "text-green-500" : "text-red-500")}>{feedback}</p>}

          {/* ✅ 다음 문장 버튼 */}
          {feedback && (
            <button
              className="mt-4 w-full rounded-lg bg-yellow-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-yellow-600"
              onClick={selectRandomSentence}>
              다음 문장 🔄
            </button>
          )}
        </div>
      ) : (
        <p className="mt-6 text-gray-500">완료된 문장이 없습니다.</p>
      )}
    </div>
  );
};

export default DictationQuizPage;
