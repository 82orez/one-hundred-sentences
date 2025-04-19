"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa6";
import { FaArrowRight, FaAssistiveListeningSystems, FaCheck, FaPlay, FaRegStopCircle } from "react-icons/fa";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { LuMousePointerClick, LuRefreshCw } from "react-icons/lu";
import { getMaskedSentence } from "@/utils/getMaskedSentence";
import { checkAnswer } from "@/utils/checkSpeakingAnswer";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineCancel, MdOutlineFavorite } from "react-icons/md";
import { queryClient } from "@/app/providers";
import { useNativeAudioAttempt } from "@/hooks/useNativeAudioAttempt";
import CountdownUI from "@/components/CountdownAnimation";
import AudioWaveform from "@/components/AudioWaveform";
import { AnimatePresence, motion } from "framer-motion";

export default function SpeakingPage() {
  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; ko: string; audioUrl: string; no: number } | null>(null);
  const [userSpoken, setUserSpoken] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const recordNativeAudioAttemptMutation = useNativeAudioAttempt();

  // 탭 모드 상태 추가
  const [mode, setMode] = useState<"normal" | "favorite">("normal");

  // 카운트다운 상태 추가
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState<string | number>("");

  // 문장 번호 배열 - 문장별 한 번씩 램덤 재생
  const remainingSentenceNosRef = useRef<number[]>([]);

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
  // 취소 플래그를 관리하는 ref
  const cancelledRef = useRef<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ 완료된 문장 목록 가져오기
  const { data: completedSentences, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["completedSentences", session?.user?.id],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/progress?userId=${session?.user?.id}`);
        console.log("🔹 API 응답 데이터:", res.data);
        return res.data.map((item: { sentence: { en: string; ko: string; audioUrl: string; no: number } }) => ({
          en: item.sentence?.en ?? "No text found",
          ko: item.sentence?.ko ?? "번역이 없습니다.",
          audioUrl: item.sentence?.audioUrl ?? "No audio found",
          no: item.sentence?.no,
        }));
      } catch (error) {
        console.error("❌ API 호출 오류:", error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // ✅ 즐겨찾기 문장 목록 가져오기
  const { data: favoriteSentences, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favoriteSentences", session?.user?.id],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/favorites/favorites-page");
        console.log("🔹 즐겨찾기 API 응답:", res.data);
        return res.data.map((item: { sentence: { en: string; ko: string; audioUrl: string; no: number } }) => ({
          en: item.sentence?.en ?? "No text found",
          ko: item.sentence?.ko ?? "번역이 없습니다.",
          audioUrl: item.sentence?.audioUrl ?? "No audio found",
          no: item.sentence?.no,
        }));
      } catch (error) {
        console.error("❌ 즐겨찾기 API 호출 오류:", error);
        return [];
      }
    },
    enabled: !!session?.user?.id && mode === "favorite",
  });

  // ✅ 현재 모드에 따라 올바른 데이터 사용
  const currentData = mode === "normal" ? completedSentences : favoriteSentences;
  const isLoading = mode === "normal" ? isLoadingCompleted : isLoadingFavorites;

  // ✅ 모드 변경 시 남은 문장 배열 초기화
  useEffect(() => {
    remainingSentenceNosRef.current = [];
    setFeedback(null);
    setUserSpoken("");
    setCurrentSentence(null);
  }, [mode]);

  // ✅ 랜덤 문장 선택
  useEffect(() => {
    if (currentData && currentData.length > 0) {
      // 남은 문장 배열이 비어있으면 모든 문장 번호로 초기화
      if (remainingSentenceNosRef.current.length === 0) {
        remainingSentenceNosRef.current = Array.from({ length: currentData.length }, (_, i) => i);
      }
      selectRandomSentence();
    }
  }, [currentData]);

  // ! 두 문장만 남았을 때 즐겨찾기 모드에서 목록 변경 감지 및 처리
  useEffect(() => {
    if (mode === "favorite" && favoriteSentences) {
      // 현재 문장이 없거나 현재 문장이 즐겨찾기 목록에 더 이상 없는 경우
      const currentSentenceExists = currentSentence && favoriteSentences.some((sentence) => sentence.no === currentSentence.no);

      if (!currentSentence || !currentSentenceExists) {
        // 즐겨찾기 목록이 비어있지 않으면 첫 번째 문장 선택
        if (favoriteSentences.length > 0) {
          setCurrentSentence(favoriteSentences[0]);
        } else {
          setCurrentSentence(null);
        }
      }
    }
  }, [mode, favoriteSentences, currentSentence]);

  // ✅ 컴포넌트 언마운트 시 음성 인식 중지
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

  // ✅ 피드백이 있을 시에는 화면 최하단으로 스크롤 (모바일에서 유용)
  useEffect(() => {
    if (feedback && bottomRef.current) {
      // 렌더링이 완료된 다음 프레임에서 실행
      requestAnimationFrame(() => {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50); // DOM 이 완전히 렌더링되기 위한 약간의 지연
      });
    }
  }, [feedback, differences]); // ✅ differences 까지 의존성에 추가

  // ✅ 램덤 문장 선택 함수: 각 문장이 한 번씩 램덤 선택
  const selectRandomSentence = () => {
    if (!currentData || currentData.length === 0) return;

    // 남은 문장이 없으면 모든 문장 번호로 초기화
    if (remainingSentenceNosRef.current.length === 0) {
      remainingSentenceNosRef.current = Array.from({ length: currentData.length }, (_, i) => i);
      console.log("🔄 모든 문장을 다시 배열에 추가했습니다.");
    }

    // 램덤 인덱스 선택
    const randomIndex = Math.floor(Math.random() * remainingSentenceNosRef.current.length);
    const selectedSentenceIndex = remainingSentenceNosRef.current[randomIndex];

    // 선택된 문장 정보 설정
    setCurrentSentence(currentData[selectedSentenceIndex]);

    // 선택된 인덱스 배열에서 제거
    remainingSentenceNosRef.current.splice(randomIndex, 1);

    // 상태 초기화
    setUserSpoken("");
    setFeedback(null);
    setShowHint(false);
    setDifferences({ missing: [], incorrect: [] });
    setIsVisible(false);
  };

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
    setUserSpoken("");
    setFeedback("");
    // 취소 플래그 초기화
    cancelledRef.current = false;

    // 카운트다운 시작
    setIsActive(true);
    setCount(3);

    // 카운트다운 타이머 설정
    setTimeout(() => setCount(2), 1000);
    setTimeout(() => setCount(1), 2000);
    setTimeout(() => setCount("시작!"), 3000);

    // 카운트다운 후 음성 인식 시작
    setTimeout(() => {
      setIsActive(false); // 카운트다운 UI 숨기기

      // 음성 인식 로직
      // 이미 실행 중인 recognition 객체가 있다면 중지
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
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

        setUserSpoken(transcript);

        // 음성 인식이 취소되지 않았을 때만 checkAnswer 함수 실행
        if (!cancelledRef.current) {
          checkAnswer(transcript, currentSentence, handleSpeechResult, setFeedback, setDifferences, setIsVisible);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        alert("음성이 입력되지 않았습니다.");
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    }, 4000);
  };

  // ✅ 음성 인식 중지
  const stopListening = () => {
    const isConfirmed = window.confirm("정말로 취소하시겠습니까?");

    if (isConfirmed) {
      // 취소 플래그 설정
      cancelledRef.current = true;

      // 카운트다운 중이면 카운트다운도 중지
      setIsActive(false);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;

        // isListening 상태를 false 로 변경
        setIsListening(false);

        // 상태값들 초기화
        setUserSpoken("");
        setFeedback("");
        setDifferences({ missing: [], incorrect: [] });

        // 버튼 비활성화
        setIsButtonDisabled(true);

        // 1초 후 버튼 다시 활성화
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 1200);
      }
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

  if (isLoading) {
    return <LoadingPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-center">
      <h1 className="text-3xl font-bold md:text-4xl">Speaking quiz</h1>
      <p className="mt-4 text-lg font-semibold text-gray-600">한글 문장을 보고 영어로 말해보세요.</p>

      <CountdownUI isActive={isActive} count={count} />

      {/* 탭 메뉴 */}
      <div className="mx-auto mt-4 mb-4 max-w-3xl md:my-8">
        <div className="flex justify-center">
          <div className="tabs tabs-lifted bg-base-100 w-full rounded-t-lg shadow-md">
            <button
              className={clsx(
                "tab tab-lg flex-1 border-b-2 font-medium transition-all duration-200 ease-in-out",
                mode === "normal" ? "tab-active !border-primary text-primary bg-base-200" : "hover:text-primary text-gray-600",
              )}
              onClick={() => setMode("normal")}>
              일반 모드
            </button>
            <button
              className={clsx(
                "tab tab-lg flex-1 border-b-2 font-medium transition-all duration-200 ease-in-out",
                mode === "favorite" ? "tab-active !border-primary text-primary bg-base-200" : "hover:text-primary text-gray-600",
              )}
              onClick={() => setMode("favorite")}>
              즐겨찾기 모드
            </button>
          </div>
        </div>
      </div>

      {currentData?.length === 0 ? (
        <div className="my-8 rounded-lg bg-gray-100 p-4 text-yellow-800">
          {mode === "normal" ? <p>학습 완료된 문장이 없습니다. 먼저 학습을 진행해주세요.</p> : <p>등록된 즐겨찾기 문장이 없습니다.</p>}
          <Link href="/dashboard" className={clsx("mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600", { hidden: mode !== "normal" })}>
            학습하러 가기
          </Link>
        </div>
      ) : (
        <div>
          {currentData ? (
            <div className={clsx("mt-6", {})}>
              <div className={"mb-1 flex items-center justify-between gap-4"}>
                {/* 빈칸 힌트 토글 */}
                <div className={clsx("flex items-center justify-center gap-2", { hidden: feedback?.includes("정답") })}>
                  {/* 이 input 이 체크되면 showHint1이 false 로 변경됩니다 */}
                  <input type="checkbox" checked={showHint1} onChange={() => setShowHint1(!showHint1)} className="toggle toggle-primary" />
                  <span className="">Hint!</span>
                </div>

                {/* 문장 변경 버튼 */}
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

                  {/* 정답 보기 버튼 */}
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
                </div>

                {/* 힌트 표시 영역 opacity-0 -> hidden */}
                {currentSentence && !feedback?.includes("정답") && (
                  <div className={`mt-4 font-medium text-blue-600 transition-opacity duration-1000 ${showHint ? "opacity-100" : "hidden"}`}>
                    {currentSentence.en}
                  </div>
                )}
              </div>

              {/* 몸통 부분 */}
              <div
                className={clsx("mt-4 mb-4 flex flex-col justify-center gap-4 md:items-center md:justify-center md:gap-4", {
                  hidden: feedback?.includes("정답") && !feedback?.includes("문맥"),
                })}>
                {/* 말하기 버튼 */}
                <button
                  onClick={startListening}
                  disabled={isPlaying || isButtonDisabled || isListening}
                  className={clsx(
                    "flex h-12 w-full min-w-36 items-center justify-center gap-1 rounded-lg px-3 py-3 text-lg font-semibold transition-all",
                    isListening ? "animate-pulse bg-green-200 text-gray-400" : "cursor-pointer bg-green-500 text-white hover:bg-green-600",
                    { "cursor-not-allowed opacity-50": isButtonDisabled },
                  )}>
                  {isListening ? (
                    <>
                      <FaAssistiveListeningSystems size={24} className="" />
                      <span>음성 인식 중...</span>
                    </>
                  ) : (
                    <>
                      <FaMicrophone size={24} className="" />
                      <span>말하기</span>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      key="listening-modal"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center rounded-xl bg-white px-8 py-6 shadow-lg">
                        <div className="mb-4 text-lg font-semibold text-gray-800">음성 인식 중입니다.</div>

                        {/* 마이크 애니메이션 */}
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="rounded-full bg-red-200 p-4 shadow-inner">
                          <FaMicrophone className="text-3xl text-red-600" />
                        </motion.div>

                        <p className="text-md mt-4 text-gray-600">말씀해 주세요!</p>
                      </motion.div>

                      {/* 말하기 취소 버튼 - 하단부 배치 */}
                      <motion.button
                        onClick={stopListening}
                        className="fixed bottom-10 mx-auto mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-medium shadow-lg"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ delay: 0.2 }}>
                        <MdOutlineCancel size={24} className="text-red-500" />
                        <span>말하기 취소</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 사용자가 말한 내용 */}
              {userSpoken && !isListening && feedback && (!feedback?.includes("정답") || feedback?.includes("문맥")) && (
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-medium">내가 말한 내용</h3>
                  <p className="rounded-lg bg-gray-100 p-3 text-gray-800">{userSpoken}</p>
                </div>
              )}

              {/* 피드백 영역 - 정답 or 오답 */}
              <div className={clsx("mt-6 text-center", { hidden: isListening })}>
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
                {/* 정답 부분(영어 문장) invisible -> hidden */}
                {/*<h3 className="mb-2 text-lg font-medium">정답</h3>*/}
                <div
                  className={clsx("flex min-h-24 items-center justify-center rounded-lg border bg-green-50 p-4 text-xl font-semibold text-gray-800", {
                    hidden: !isVisible,
                    visible: isVisible,
                  })}>
                  <p>{currentSentence?.en}</p>
                </div>
              </div>
            </div>
          ) : (
            completedSentences?.length > 0 && <p className="mt-8 text-lg text-gray-500">문장을 불러오는 중...</p>
          )}
        </div>
      )}

      {/* 다음 퀴즈에 도전 버튼 */}
      <div
        className={clsx("mt-8 flex justify-center", {
          hidden: !feedback?.includes("정답"),
        })}>
        <button
          onClick={() => {
            selectRandomSentence();
            setDifferences({ missing: [], incorrect: [] });
          }}
          disabled={isListening || isPlaying}
          className={clsx("btn btn-primary flex items-center justify-center gap-2 text-lg", {})}>
          <span>다음 퀴즈에 도전</span>
          <FaArrowRight />
        </button>
      </div>

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoading })}>
        <Link href={"/dashboard"}>Back to My Dashboard</Link>
      </div>

      {/* 👇 페이지 최하단 ref */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
