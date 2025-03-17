"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";

export default function SpeakingPage() {
  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; ko: string; audioUrl: string } | null>(null);
  const [userSpoken, setUserSpoken] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true); // 초기에는 영어 문장을 흐리게 표시

  // 완료된 문장 목록 가져오기
  const { data: completedSentences, isLoading } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
        console.log("🔹 API 응답 데이터:", res.data);
        return res.data.map((item: { sentence: { en: string; ko: string; audioUrl: string } }) => ({
          en: item.sentence?.en ?? "No text found",
          ko: item.sentence?.ko ?? "번역이 없습니다.",
          audioUrl: item.sentence?.audioUrl ?? "No audio found",
        }));
      } catch (error) {
        console.error("❌ API 호출 오류:", error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // 랜덤 문장 선택
  useEffect(() => {
    if (completedSentences && completedSentences.length > 0) {
      selectRandomSentence();
    }
  }, [completedSentences]);

  const selectRandomSentence = () => {
    if (!completedSentences || completedSentences.length === 0) return;
    const randomIndex = Math.floor(Math.random() * completedSentences.length);
    const selected = completedSentences[randomIndex];

    console.log("🔹 선택된 문장:", selected);
    setCurrentSentence(selected);
    setUserSpoken("");
    setFeedback(null);
    setIsBlurred(true); // 새로운 문장이 나올 때마다 blur 처리 활성화
  };

  // 음성 인식 시작
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    // true 이면 연속적으로 인식, false 면 한 문장만 인식
    recognition.continuous = false;
    // true 이면 중간 결과 제공, false 면 최종 결과만 제공
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log("🎙️ 인식된 음성:", transcript);
      console.log("confidence 음성:", confidence);

      setUserSpoken(transcript);

      checkAnswer(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("❌ 음성 인식 오류:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 정답 확인
  const checkAnswer = (spoken: string) => {
    if (!currentSentence) return;

    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[.,\/#!?'"$%\^&\*;:{}=\-_`~()]/g, "");

    const normalizedSpoken = normalizeText(spoken);
    const normalizedAnswer = normalizeText(currentSentence.en);

    console.log("📝 말한 내용:", normalizedSpoken);
    console.log("✅ 정답:", normalizedAnswer);

    if (normalizedSpoken === normalizedAnswer) {
      setFeedback("정답입니다!");
      setIsBlurred(false); // 정답 맞히면 blur 해제
    } else {
      setFeedback("❌ 다시 도전해 보세요.");
    }
  };

  // 답안 확인하기
  const showAnswer = () => {
    setIsBlurred(false);
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-500">문장을 불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-4xl font-bold">Speaking quiz</h1>
      <p className="mt-4 text-lg text-gray-600">한글 문장을 보고 영어로 말해보세요.</p>

      {completedSentences?.length === 0 && (
        <div className="my-8 rounded-lg bg-yellow-100 p-4 text-yellow-800">
          <p>학습 완료된 문장이 없습니다. 먼저 학습을 진행해주세요.</p>
          <Link href="/learn" className="mt-2 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            학습하러 가기
          </Link>
        </div>
      )}

      {currentSentence ? (
        <div className="mt-6">
          {/* 한글 문장 표시 */}
          <div className="mb-8 rounded-lg border bg-white p-4 text-xl font-semibold text-gray-800">
            <p>{currentSentence.ko}</p>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-4 mb-6 flex justify-center gap-3">
            <button
              onClick={startListening}
              disabled={isListening}
              className={clsx(
                "rounded-lg px-6 py-3 text-white transition-all",
                isListening ? "animate-pulse bg-red-500" : "bg-green-500 hover:bg-green-600",
              )}>
              {isListening ? "듣는 중..." : "🎙️ 말하기"}
            </button>

            <button onClick={selectRandomSentence} className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600">
              ↻ 다른 문장
            </button>

            <button onClick={showAnswer} className="rounded-lg bg-gray-500 px-6 py-3 text-white hover:bg-gray-600">
              💡 정답 보기
            </button>
          </div>

          {/* 사용자가 말한 내용 */}
          {userSpoken && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-medium">내가 말한 내용:</h3>
              <p className="rounded-lg bg-gray-100 p-3 text-gray-800">{userSpoken}</p>
            </div>
          )}

          {/* 피드백 */}
          {feedback && (
            <div className={clsx("mb-4 rounded-lg p-3", feedback.includes("정답") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
              <p className="text-lg font-medium">{feedback}</p>
            </div>
          )}

          {/* 블러 처리된 정답 (영어 문장) */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">정답:</h3>
            <div className={clsx("rounded-lg border bg-gray-100 p-4 text-xl font-semibold text-gray-800", isBlurred ? "blur-md" : "blur-none")}>
              <p>{currentSentence.en}</p>
            </div>
          </div>
        </div>
      ) : (
        completedSentences?.length > 0 && <p className="mt-8 text-lg text-gray-500">문장을 불러오는 중...</p>
      )}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading })}>
        <Link href={"/learn"}>Back to My page</Link>
      </div>
    </div>
  );
}
