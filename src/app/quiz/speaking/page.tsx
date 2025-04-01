"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa6";
import { FaPlay, FaRegStopCircle } from "react-icons/fa";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { LuMousePointerClick, LuRefreshCw } from "react-icons/lu";

export default function SpeakingPage() {
  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; ko: string; audioUrl: string } | null>(null);
  const [userSpoken, setUserSpoken] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 오디오 재생 상태를 관리할 새로운 상태 변수
  const [isPlaying, setIsPlaying] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // 음성 인식 객체 참조
  const recognitionRef = useRef<any>(null);
  // 오디오 객체 참조 추가
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 다른 부분을 저장할 상태 변수 추가
  const [differences, setDifferences] = useState<{
    missing: string[];
    incorrect: { spoken: string; correct: string }[];
  }>({ missing: [], incorrect: [] });

  // Hint 관련 상태 변수 추가 (기존 state 목록 아래에 추가)
  const [showHint, setShowHint] = useState(false);

  // ✅ 완료된 문장 목록 가져오기
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

  // ✅ 랜덤 문장 선택
  useEffect(() => {
    if (completedSentences && completedSentences.length > 0) {
      selectRandomSentence();
    }
  }, [completedSentences]);

  // 컴포넌트 언마운트 시 음성 인식 중지
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // 오디오가 재생 중이면 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const selectRandomSentence = () => {
    if (!completedSentences || completedSentences.length === 0) return;
    const randomIndex = Math.floor(Math.random() * completedSentences.length);
    const selected = completedSentences[randomIndex];

    console.log("🔹 선택된 문장:", selected);
    setCurrentSentence(selected);
    setUserSpoken("");
    setFeedback(null);
    setIsVisible(false);
  };

  // ✅ 음성 인식 시작
  const startListening = () => {
    // 오디오 재생 중이면 음성 인식 시작하지 않음
    if (isPlaying) return;

    if (!("webkitSpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    // 이미 실행 중인 recognition 객체가 있다면 중지
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
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
      // console.error("❌ 음성 인식 오류:", event.error);
      setIsListening(false);
      alert("음성이 입력되지 않았습니다.");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  // ✅ 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;

      // 버튼 비활성화
      setIsButtonDisabled(true);

      // 1초 후 버튼 다시 활성화
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 1200);
    }
  };

  // ✅ 힌트 보기 기능을 위한 함수 추가
  const handleShowHint = () => {
    setShowHint(true);
    // 3초 후에 힌트를 서서히 사라지게 함
    setTimeout(() => {
      setShowHint(false);
    }, 3000); // 3000ms = 3초
  };

  // ✅ 정답 확인
  const checkAnswer = (spoken: string) => {
    if (!currentSentence) return;

    const normalizeText = (text: string) => {
      // 다양한 종류의 아포스트로피를 단일 형태로 통일
      const standardizedText = text.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u0060\u00B4]/g, "'");

      return (
        standardizedText
          .toLowerCase()
          // 조동사 축약형 처리
          // 대명사+'d 패턴을 한번에 처리
          .replace(/\b(i|he|she|it|we|they|you|who)'d\b/gi, "$1 would")
          // 조동사 축약형은 'would' 외에도 'had' 의 의미로도 쓰일 수 있어 컨텍스트에 따라 선택 필요
          // 'had' 확장이 필요한 경우 아래 주석 해제
          // .replace(/\bi'd\b/g, "i had")
          // 그 외의 경우 'would' 로 처리
          .replace(/\b(\w+)'d\b/gi, "$1 would")
          // ... (다른 had 축약형)
          .replace(/\bwhere's\b/g, "where is")
          .replace(/\bwhat's\b/g, "what is")

          .replace(/\ba\b/g, "the") // !
          .replace(/\bcan\b/g, "could") // !
          .replace(/\bself-checking\b/g, "self check in") // !

          // 다른 일반적인 축약형도 처리
          .replace(/\bi'll\b/g, "i will")
          .replace(/\bi've\b/g, "i have")
          .replace(/\bi'm\b/g, "i am")
          .replace(/\bdon't\b/g, "do not")
          .replace(/\bcan't\b/g, "cannot")
          .replace(/\bwon't\b/g, "will not")
          .replace(/\bisn't\b/g, "is not")
          .replace(/\baren't\b/g, "are not")

          // 그 외 문장 부호와 공백 정리
          .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
          .replace(/\s+/g, " ")
          .trim()
      );
    };

    const normalizedSpoken = normalizeText(spoken);
    const normalizedAnswer = normalizeText(currentSentence.en);

    console.log("📝 말한 내용:", normalizedSpoken);
    console.log("✅ 정답:", normalizedAnswer);

    if (normalizedSpoken === normalizedAnswer) {
      setFeedback("정답입니다!");
      setIsVisible(true);
    } else {
      // 차이점 찾기
      const spokenWords = normalizedSpoken.split(" ");
      const answerWords = normalizedAnswer.split(" ");

      const findDifferences = (spoken: string[], answer: string[]) => {
        const differences = {
          missing: [] as string[],
          incorrect: [] as { spoken: string; correct: string }[],
        };

        const maxLength = Math.max(spoken.length, answer.length);

        for (let i = 0; i < maxLength; i++) {
          // 말한 단어가 없는 경우 (누락)
          if (i >= spoken.length && i < answer.length) {
            differences.missing.push(answer[i]);
            continue;
          }

          // 단어가 다른 경우 (오류)
          if (i < spoken.length && i < answer.length && spoken[i] !== answer[i]) {
            differences.incorrect.push({
              spoken: spoken[i],
              correct: answer[i],
            });
          }
        }

        return differences;
      };

      const diffs = findDifferences(spokenWords, answerWords);
      setDifferences(diffs);
      setFeedback("❌ 다시 도전해 보세요.");
    }
  };

  // ✅ 답안 확인하기 - 토글 형태로 변경된 함수:
  const toggleAnswer = () => {
    setIsVisible(!isVisible);
  };

  // ✅ 오디오 재생 함수
  const playNativeAudio = () => {
    if (!currentSentence?.audioUrl) return;

    // 이미 재생 중인 오디오가 있다면 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(currentSentence.audioUrl);
    audioRef.current = audio;

    // * 재생 속도 설정
    audio.playbackRate = 0.8;

    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.error("❌ 오디오 재생 오류");
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.play().catch((err) => {
      console.error("❌ 오디오 재생 실패:", err);
      setIsPlaying(false);
      audioRef.current = null;
    });
  };

  if (isLoading) {
    return <LoadingPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-3xl font-bold md:text-4xl">Speaking quiz</h1>
      <p className="mt-4 text-lg font-semibold text-gray-600">한글 문장을 보고 영어로 말해보세요.</p>

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
          <div className={"flex items-center justify-end"}>
            <button
              className={clsx("flex items-center gap-2 hover:cursor-pointer hover:underline", { hidden: feedback?.includes("정답") })}
              onClick={() => {
                selectRandomSentence();
                setDifferences({ missing: [], incorrect: [] });
              }}
              disabled={isListening || isPlaying}>
              <LuRefreshCw size={20} />
              <span>문장 변경</span>
            </button>
          </div>

          <div className="mt-1 mb-6 flex min-h-24 flex-col items-center justify-center rounded-lg border bg-white p-4 text-xl font-semibold text-gray-800 md:mb-8">
            {/* 한글 문장 표시 */}
            <p>{currentSentence.ko}</p>

            <div className="mt-8 flex items-center justify-center gap-4">
              {/* 원어민 음성 재생 부분 */}
              {currentSentence && (
                <button
                  onClick={playNativeAudio}
                  disabled={isListening || isPlaying}
                  className="btn btn-primary btn-soft flex min-w-28 items-center justify-center gap-2 rounded-lg p-2 font-bold">
                  <FaPlay /> 원어민 음성
                </button>
              )}

              {/* 힌트 버튼 */}
              <button
                onClick={handleShowHint}
                className="btn btn-secondary btn-soft flex min-w-28 items-center justify-center gap-2 rounded-lg p-2 font-bold">
                <LuMousePointerClick size={24} />
                힌트 보기
              </button>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-4 mb-4 flex flex-col justify-center gap-4 md:flex-row md:items-center md:justify-center md:gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isPlaying || isButtonDisabled}
              className={clsx(
                "flex h-12 min-w-36 items-center justify-center gap-1 rounded-lg px-3 py-3 text-white transition-all",
                isListening ? "animate-pulse bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
                { hidden: feedback?.includes("정답") },
                { "cursor-not-allowed opacity-50": isButtonDisabled },
              )}>
              {isListening ? (
                <>
                  <FaRegStopCircle size={24} className="" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FaMicrophone size={24} className="" />
                  <span>말하기</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                selectRandomSentence();
                setDifferences({ missing: [], incorrect: [] });
              }}
              disabled={isListening || isPlaying}
              className={clsx("w-full min-w-36 rounded-lg bg-blue-500 px-3 py-2 text-lg text-white hover:bg-blue-600", {
                hidden: !feedback?.includes("정답"),
              })}>
              ↻ 다음 퀴즈
            </button>

            <button
              onClick={toggleAnswer}
              disabled={isListening || isPlaying}
              className={clsx("min-w-36 rounded-lg bg-gray-500 px-3 py-3 text-white hover:bg-gray-600", { hidden: feedback?.includes("정답") })}>
              {isVisible ? "💡 정답 숨기기" : "💡 정답 보기"}
            </button>
          </div>

          {/* 힌트 버튼 */}
          {/*<button*/}
          {/*  onClick={handleShowHint}*/}
          {/*  className="mt-4 rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none">*/}
          {/*  힌트 보기*/}
          {/*</button>*/}

          {/* 힌트 표시 영역 */}
          {currentSentence && (
            <div className={`mt-2 font-medium text-blue-600 transition-opacity duration-1000 ${showHint ? "opacity-100" : "opacity-0"}`}>
              {currentSentence.en}
            </div>
          )}

          {/* 사용자가 말한 내용 */}
          {userSpoken && !isListening && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-medium">내가 말한 내용</h3>
              <p className="rounded-lg bg-gray-100 p-3 text-gray-800">{userSpoken}</p>
            </div>
          )}

          {/* 피드백 */}
          {/*{feedback && !isListening && (*/}
          {/*  <div className={clsx("mb-4 rounded-lg p-3", feedback.includes("정답") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>*/}
          {/*    <p className="text-xl font-semibold">{feedback}</p>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/* 피드백 영역 */}
          <div className="mt-6 text-center">
            {feedback && !isListening && (
              <div className={clsx("mb-4 rounded-lg p-3", feedback.includes("정답") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                <p className="text-xl font-semibold">{feedback}</p>
              </div>
            )}

            {/* 차이점 표시 영역 */}
            {feedback?.includes("❌") && !isListening && (differences.missing.length > 0 || differences.incorrect.length > 0) && (
              <div className="mt-4 space-y-3">
                {differences.missing.length > 0 && (
                  <div>
                    <p className="font-medium text-amber-600">누락된 단어:</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {differences.missing.map((word, index) => (
                        <span key={index} className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {differences.incorrect.length > 0 && (
                  <div>
                    <p className="font-medium text-rose-600">잘못 말한 단어:</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {differences.incorrect.map((item, index) => (
                        <div key={index} className="flex flex-col items-center rounded bg-rose-50 p-2">
                          <span className="text-rose-700 line-through">{item.spoken}</span>
                          <span className="text-emerald-700">→ {item.correct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col md:mt-8">
            {/* 정답 부분(영어 문장) */}
            {/*<h3 className="mb-2 text-lg font-medium">정답</h3>*/}
            <div
              className={clsx("flex min-h-24 items-center justify-center rounded-lg border bg-gray-100 p-4 text-xl font-semibold text-gray-800", {
                invisible: !isVisible,
                visible: isVisible,
              })}>
              <p>{currentSentence.en}</p>
            </div>

            {/* 원어민 음성 재생 부분 */}
            {/*{currentSentence && (*/}
            {/*  <button*/}
            {/*    onClick={playNativeAudio}*/}
            {/*    disabled={isListening || isPlaying}*/}
            {/*    className="btn btn-warning btn-outline mt-4 flex items-center justify-center gap-2 rounded-lg py-5 font-bold md:mt-8">*/}
            {/*    <FaPlay /> 원어민 음성 듣기*/}
            {/*  </button>*/}
            {/*)}*/}
          </div>
        </div>
      ) : (
        completedSentences?.length > 0 && <p className="mt-8 text-lg text-gray-500">문장을 불러오는 중...</p>
      )}

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoading })}>
        <Link href={"/dashboard"}>Back to My Dashboard</Link>
      </div>
    </div>
  );
}
