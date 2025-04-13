"use client";

import { useEffect, useState, useRef, use } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa6";
import { FaArrowRight, FaCheck, FaPlay, FaRegStopCircle } from "react-icons/fa";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { LuMousePointerClick, LuRefreshCw } from "react-icons/lu";
import { getMaskedSentence } from "@/utils/getMaskedSentence";
import { checkAnswer } from "@/utils/checkSpeakingAnswer";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineFavorite } from "react-icons/md";
import { queryClient } from "@/app/providers";
import { useNativeAudioAttempt } from "@/hooks/useNativeAudioAttempt";

type Props = {
  params: Promise<{ sentence: string }>;
};

export default function SpeakingPage({ params }: Props) {
  const { sentence } = use(params);
  const currentSentenceNumber = parseInt(sentence, 10);

  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; ko: string; audioUrl: string; no: number } | null>(null);

  const [userSpoken, setUserSpoken] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const recordNativeAudioAttemptMutation = useNativeAudioAttempt();

  // Hint 관련 상태 변수 추가 (기존 state 목록 아래에 추가)
  const [showHint, setShowHint] = useState(false); // 정답 보기
  const [showHint1, setShowHint1] = useState(true); // Hint

  // 정답과 다른 부분을 저장할 상태 변수 추가
  const [differences, setDifferences] = useState<{
    missing: string[];
    incorrect: { spoken: string; correct: string }[];
  }>({ missing: [], incorrect: [] });

  // 오디오 재생 상태를 관리할 새로운 상태 변수
  const [isPlaying, setIsPlaying] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // 음성 인식 객체 참조
  const recognitionRef = useRef<any>(null);
  // 오디오 객체 참조 추가
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ 현재 문장 불러오기
  const { data: sentenceData, isLoading: isLoadingSentence } = useQuery({
    queryKey: ["sentence", currentSentenceNumber],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/sentence/${currentSentenceNumber}`);
        console.log("sentenceData: ", res.data);
        return res.data;
      } catch (error) {
        console.error("❌ 문장 데이터 로드 오류:", error);
        return null;
      }
    },
    enabled: !!currentSentenceNumber,
  });

  // 문장 데이터가 로드되면 currentSentence 상태 업데이트
  useEffect(() => {
    if (sentenceData) {
      setCurrentSentence({
        en: sentenceData.en,
        ko: sentenceData.ko,
        audioUrl: sentenceData.audioUrl,
        no: sentenceData.no,
      });
    }
  }, [sentenceData]);

  // ✅ 즐겨찾기 상태 확인 useQuery
  const { data: favoriteStatus } = useQuery({
    queryKey: ["favoriteStatus", session?.user?.id, currentSentence?.no],
    queryFn: async () => {
      if (!session?.user || typeof currentSentence?.no !== "number") {
        return { isFavorite: false };
      }

      const response = await axios.get(`/api/favorites?sentenceNo=${currentSentence.no}`);
      return response.data;
    },
    enabled: !!session?.user && typeof currentSentence?.no === "number",
  });

  // ✅ isFavorite 상태 업데이트
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  // ✅ 즐겨찾기 토글 useMutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (sentenceNo: number) => {
      const response = await axios.post("/api/favorites", { sentenceNo });
      return response.data;
    },
    onSuccess: (data) => {
      setIsFavorite(data.isFavorite);
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["favoriteSentences", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["favoriteStatus", session?.user?.id, currentSentence?.no] });
    },
    onError: (error) => {
      console.error("즐겨찾기 토글 중 오류:", error);
    },
  });

  // ✅ 즐겨찾기 토글 함수
  const toggleFavorite = () => {
    if (!session?.user || !currentSentence.no) return;
    toggleFavoriteMutation.mutate(currentSentence.no);
  };

  // ✅ 원어민 음성 재생 함수
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

    recordNativeAudioAttemptMutation.mutate({ sentenceNo: currentSentence.no });

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

  // ✅ 힌트 보기 함수
  const handleShowHint = () => {
    setShowHint(true);
    // 시간 조절 가능 - 1.5초 후에 힌트를 서서히 사라지게 함
    setTimeout(() => {
      setShowHint(false);
    }, 1500); // 1500ms = 1.5초
  };

  // ✅ 힌트 보기 기능을 위한 함수 추가
  // const toggleHint = () => {
  //   setShowHint1(!showHint1);
  // };

  // ✅ 음성 인식 시작
  const startListening = async () => {
    // 오디오 재생 중이면 음성 인식 시작하지 않음
    if (isPlaying) return;

    if (!("webkitSpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    setIsVisible(false);
    setDifferences({ missing: [], incorrect: [] });
    // setFeedback(null);
    setUserSpoken("");

    // 현재 문장이 있을 때만 시도 횟수 증가 API 호출
    // if (currentSentence && session?.user) {
    //   try {
    //     await axios.post("/api/attempts/speaking", {
    //       sentenceNo: currentSentence.no,
    //     });
    //   } catch (error) {
    //     console.error("시도 횟수 기록 실패:", error);
    //   }
    // }

    // 이미 실행 중인 recognition 객체가 있다면 중지
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    // 틀린 부분 초기화
    setDifferences({ missing: [], incorrect: [] });

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log("🎙️ 실제 내 음성:", transcript);
      console.log("confidence 음성:", confidence);

      setUserSpoken(transcript);

      checkAnswer(transcript, currentSentence, handleSpeechResult, setFeedback, setDifferences, setIsVisible);
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

      // isListening 상태를 false 로 변경
      setIsListening(false);

      // 기본적인 상태값들 초기화
      setUserSpoken("");
      // setFeedback(null);
      setDifferences({ missing: [], incorrect: [] });

      // 버튼 비활성화
      setIsButtonDisabled(true);

      // 1초 후 버튼 다시 활성화
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 1200);
    }
  };

  // ✅ 음성 인식 후 결과 관련 횟수를 서버에 저장하는 함수
  const handleSpeechResult = async (isCorrect: boolean) => {
    if (currentSentence && session?.user) {
      try {
        await axios.post("/api/attempts/speaking", {
          sentenceNo: currentSentence.no,
          isCorrect,
        });
      } catch (error) {
        console.error("시도 기록 실패:", error);
      }
    }
  };

  // ✅ 답안 확인하기 - 토글 형태로 변경된 함수:
  // const toggleAnswer = () => {
  //   setIsVisible(!isVisible);
  // };

  if (isLoadingSentence) {
    return <LoadingPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-3xl font-bold md:text-4xl">Speaking quiz</h1>
      <p className="mt-4 text-lg font-semibold text-gray-600">한글 문장을 보고 영어로 말해보세요.</p>

      {sentenceData?.length === 0 ? (
        <div className="my-8 rounded-lg bg-gray-100 p-4 text-yellow-800">
          <p>학습 완료된 문장이 없습니다. 먼저 학습을 진행해주세요.</p>
          <Link href="/dashboard" className={clsx("mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600", {})}>
            학습하러 가기
          </Link>
        </div>
      ) : (
        <div>
          {sentenceData ? (
            <div className={clsx("mt-6", {})}>
              <div className={"mb-1 flex items-center justify-between gap-4"}>
                {/* 빈칸 힌트 토글 */}
                <div className={clsx("flex items-center justify-center gap-2", { hidden: feedback?.includes("정답") })}>
                  {/* 이 input 이 체크되면 showHint1이 false 로 변경됩니다 */}
                  <input type="checkbox" checked={showHint1} onChange={() => setShowHint1(!showHint1)} className="toggle toggle-primary" />
                  <span className="">Hint!</span>
                </div>
              </div>

              {/* 출제 부분 */}
              <div className="mt-1 mb-1 flex min-h-24 flex-col items-center justify-center rounded-lg border bg-white p-4 text-xl font-semibold text-gray-800 md:mb-1">
                <div className={"mb-4 flex w-full items-center justify-around"}>
                  <div className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {currentSentence?.no}번 문장
                  </div>
                  <button className={"flex items-center justify-center gap-2 text-sm"} onClick={toggleFavorite}>
                    <div>
                      <GrFavorite size={25} className={clsx({ "text-gray-400": !isFavorite }, { hidden: isFavorite })} />
                      <MdOutlineFavorite size={25} className={clsx({ "text-yellow-400": isFavorite }, { hidden: !isFavorite })} />
                    </div>
                    <div className={""}>즐겨찾기</div>
                  </button>
                </div>

                {/* 한글 문장 표시 */}
                <p>{currentSentence?.ko}</p>

                {/* 빈칸 힌트 부분 */}
                {showHint1 && (
                  <div
                    className={clsx("mt-4 rounded-lg border border-gray-200 bg-white p-4 text-center text-xl shadow-sm", {
                      hidden: feedback?.includes("정답"),
                    })}>
                    {getMaskedSentence(currentSentence)}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-4">
                  {/* 원어민 음성 재생 부분 */}
                  {currentSentence && (
                    <button
                      onClick={playNativeAudio}
                      disabled={isListening || isPlaying}
                      className="btn btn-primary btn-soft flex min-w-32 items-center justify-center gap-2 rounded-lg p-2 text-[1rem] font-semibold">
                      <FaPlay /> 원어민 음성
                    </button>
                  )}

                  {/* 힌트 버튼 */}
                  <button
                    onClick={handleShowHint}
                    disabled={isListening || isPlaying}
                    className={clsx(
                      "btn btn-secondary btn-soft flex min-w-32 items-center justify-center gap-2 rounded-lg p-2 text-[1rem] font-semibold",
                      { hidden: feedback?.includes("정답") },
                      { "animate-pulse bg-red-300": feedback?.includes("❌") && !isListening },
                    )}>
                    <LuMousePointerClick size={24} />
                    정답 보기
                  </button>

                  {/*<button onClick={toggleHint} className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">*/}
                  {/*  {showHint1 ? "힌트 숨기기" : "힌트 보기"}*/}
                  {/*</button>*/}
                </div>

                {/* 힌트 표시 영역 */}
                {currentSentence && !feedback?.includes("정답") && (
                  <div className={`mt-4 font-medium text-blue-600 transition-opacity duration-1000 ${showHint ? "opacity-100" : "opacity-0"}`}>
                    {currentSentence.en}
                  </div>
                )}
              </div>

              {/* 몸통 부분 */}
              <div
                className={clsx("mt-4 mb-4 flex flex-col justify-center gap-4 md:flex-row md:items-center md:justify-center md:gap-4", {
                  hidden: feedback?.includes("정답") && !feedback?.includes("문맥"),
                })}>
                {/* 말하기 버튼 */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isPlaying || isButtonDisabled}
                  className={clsx(
                    "flex h-12 min-w-36 items-center justify-center gap-1 rounded-lg px-3 py-3 text-lg font-semibold text-white transition-all",
                    isListening ? "animate-pulse bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
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

                {/*  정답 보기 버튼 */}
                {/*<button*/}
                {/*  onClick={toggleAnswer}*/}
                {/*  disabled={isListening || isPlaying}*/}
                {/*  className={clsx("min-w-36 rounded-lg bg-gray-500 px-3 py-3 text-white hover:bg-gray-600", { hidden: feedback?.includes("정답") })}>*/}
                {/*  {isVisible ? "💡 정답 가리기" : "💡 정답 보기"}*/}
                {/*</button>*/}
              </div>

              {/* 힌트 버튼 */}
              {/*<button*/}
              {/*  onClick={handleShowHint}*/}
              {/*  className="mt-4 rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none">*/}
              {/*  힌트 보기*/}
              {/*</button>*/}

              {/* 사용자가 말한 내용 */}
              {userSpoken && !isListening && (!feedback?.includes("정답") || feedback?.includes("문맥")) && (
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-medium">내가 말한 내용</h3>
                  <p className="rounded-lg bg-gray-100 p-3 text-gray-800">{userSpoken}</p>
                </div>
              )}

              {/* 피드백 영역 - 정답 or 오답 */}
              <div className="mt-6 text-center">
                {feedback && (
                  <div
                    className={clsx(
                      "mb-4 flex items-center justify-center gap-2 rounded-lg p-3",
                      feedback.includes("정답") ? "text-green-800" : "bg-red-100 text-red-800",
                    )}>
                    <FaCheck className={clsx({ hidden: !feedback?.includes("정답") })} />
                    <p className="text-xl font-semibold">{feedback}</p>
                  </div>
                )}

                {/* 차이점 표시 영역 */}
                {!isListening && (differences.missing.length > 0 || differences.incorrect.length > 0) && (
                  <div className="mt-4 space-y-3">
                    {differences.incorrect.length > 0 && (
                      <div>
                        <p
                          className={clsx(
                            "font-medium",
                            { "text-blue-400": feedback?.includes("문맥") },
                            { "text-red-400": feedback?.includes("❌") },
                          )}>
                          {feedback?.includes("문맥") ? "정답과 다른 표현" : "잘못된 표현"}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                          {differences.incorrect.map((item, index) => (
                            <div
                              key={index}
                              className={clsx(
                                "flex flex-col items-center rounded p-2",
                                { "bg-blue-100": feedback?.includes("문맥") },
                                { "bg-rose-50": feedback?.includes("❌") },
                              )}>
                              <span className="text-rose-700 line-through">{item.spoken}</span>
                              <span className="text-emerald-700">→ {item.correct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col md:mt-6">
                {/* 정답 부분(영어 문장) */}
                {/*<h3 className="mb-2 text-lg font-medium">정답</h3>*/}
                <div
                  className={clsx("flex min-h-24 items-center justify-center rounded-lg border bg-green-50 p-4 text-xl font-semibold text-gray-800", {
                    invisible: !isVisible,
                    visible: isVisible,
                  })}>
                  <p>{currentSentence?.en}</p>
                </div>
              </div>
            </div>
          ) : (
            sentenceData?.length > 0 && <p className="mt-8 text-lg text-gray-500">문장을 불러오는 중...</p>
          )}
        </div>
      )}

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoadingSentence })}>
        <Link href={"/dashboard"}>Back to My Dashboard</Link>
      </div>
    </div>
  );
}
