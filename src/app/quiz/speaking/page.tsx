"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa6";
import { FaArrowRight, FaCheck, FaPlay, FaRegStopCircle } from "react-icons/fa";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { LuMousePointerClick, LuRefreshCw } from "react-icons/lu";
import { getMaskedSentence } from "@/utils/getMaskedSentence";
import nlp from "compromise";

export default function SpeakingPage() {
  const { data: session } = useSession();
  const [currentSentence, setCurrentSentence] = useState<{ en: string; ko: string; audioUrl: string; no: number } | null>(null);
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

  const [showHint1, setShowHint1] = useState(true);

  // ✅ 완료된 문장 목록 가져오기
  const { data: completedSentences, isLoading } = useQuery({
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
  const toggleHint = () => {
    setShowHint1(!showHint1);
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

  // ✅ 정답 확인 (의미론적 유사성 향상)
  const checkAnswer = (spoken: string) => {
    if (!currentSentence) return;

    const normalizeText = (text: string) => {
      // 기존 정규화 코드 유지
      // 다양한 종류의 아포스트로피를 단일 형태로 통일
      const standardizedText = text.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u0060\u00B4]/g, "'");

      return (
        standardizedText
          .toLowerCase()
          // 조동사 축약형 처리
          .replace(/\b(i|he|she|it|we|they|you|who)'d\b/gi, "$1 would")
          .replace(/\b(\w+)'d\b/gi, "$1 would")
          .replace(/\bwhere's\b/g, "where is")
          .replace(/\bwhat's\b/g, "what is")
          .replace(/\bthere's\b/g, "there is")
          .replace(/\bself-checking\b/g, "self check in")
          .replace(/\bself checking\b/g, "self check in")
          .replace(/\bself check-in\b/g, "self check in")
          // .replace(/\bon food\b/g, "on foot")
          .replace(/\bi'll\b/g, "i will")
          .replace(/\bi've\b/g, "i have")
          .replace(/\bi'm\b/g, "i am")
          .replace(/\bdon't\b/g, "do not")
          .replace(/\bcan't\b/g, "cannot")
          .replace(/\bwon't\b/g, "will not")
          .replace(/\bisn't\b/g, "is not")
          .replace(/\baren't\b/g, "are not")
          .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
          .replace(/\s+/g, " ")
          .trim()
      );
    };

    const normalizedSpoken = normalizeText(spoken);
    const normalizedAnswer = normalizeText(currentSentence.en);

    console.log("📝 말한 내용:", normalizedSpoken);
    console.log("✅ 정답:", normalizedAnswer);

    // 두 문장이 완전히 같으면 바로 정답 처리
    if (normalizedSpoken === normalizedAnswer) {
      setFeedback("정답입니다!");
      handleSpeechResult(true);
      setIsVisible(true);
      return;
    }

    // 발음이 유사한 단어들의 사전을 생성하여 비교 전에 정규화
    const similarSoundingWords: Record<string, string[]> = {
      // 기존 발음 유사 단어 사전 유지
      their: ["there", "they're", "they are"],
      there: ["their", "they're"],
      "they're": ["their", "there"],
      "they are": ["their", "there"],
      to: ["too", "two"],
      too: ["to", "two"],
      two: ["to", "too"],
      for: ["four"],
      four: ["for"],
      see: ["sea"],
      sea: ["see"],
      know: ["no"],
      no: ["know"],
      write: ["right"],
      right: ["write"],
      here: ["hear"],
      hear: ["here"],
      by: ["buy", "bye"],
      buy: ["by", "bye"],
      bye: ["by", "buy"],
      wear: ["where"],
      where: ["wear"],
      your: ["you're", "you are"],
      "you're": ["your"],
      "you are": ["your"],
      its: ["it's"],
      "it's": ["its"],
      weather: ["whether"],
      whether: ["weather"],
      affect: ["effect"],
      effect: ["affect"],
      accept: ["except"],
      except: ["accept"],
      then: ["than"],
      than: ["then"],
      // "is your": ["is there"], // !
      // ... 기존 단어들

      // 의미적으로 유사한 단어/표현 추가
      good: ["great", "nice", "excellent", "perfect", "wonderful", "terrific"],
      bad: ["terrible", "awful", "poor", "not good"],
      big: ["large", "huge", "enormous", "gigantic"],
      small: ["little", "tiny", "petite"],
      happy: ["glad", "pleased", "delighted", "content"],
      sad: ["unhappy", "upset", "depressed", "down"],
      // 추가적인 유의어 계속 확장
    };

    // ***** 의미론적 유사성 비교 개선 부분 *****

    // 1. compromise 라이브러리를 활용한 문장 구조 분석
    // import nlp from 'compromise';

    // 문장의 핵심 구성요소를 추출하는 함수
    const extractCoreComponents = (text: string) => {
      const doc = nlp(text);
      const subjects = doc.match("#Noun").if("#Pronoun").out("array");
      const verbs = doc.verbs().out("array");
      const objects = doc.match("#Noun").not("#Subject").out("array");

      return { subjects, verbs, objects };
    };

    // 두 문장의 핵심 요소 비교
    const spokenCore = extractCoreComponents(normalizedSpoken);
    const answerCore = extractCoreComponents(normalizedAnswer);

    // 핵심 요소가 얼마나 일치하는지 점수 계산
    const calculateSimilarityScore = (spokenCore: any, answerCore: any) => {
      let score = 0;
      const maxScore = 3; // 주어, 동사, 목적어 각각 1점씩

      // 주어 비교
      const hasMatchingSubject = spokenCore.subjects.some(
        (subject: string) =>
          answerCore.subjects.includes(subject) ||
          answerCore.subjects.some((answerSubject: string) => isSimilarWord(subject, answerSubject, similarSoundingWords)),
      );
      if (hasMatchingSubject) score += 1;

      // 동사 비교
      const hasMatchingVerb = spokenCore.verbs.some(
        (verb: string) =>
          answerCore.verbs.includes(verb) || answerCore.verbs.some((answerVerb: string) => isSimilarWord(verb, answerVerb, similarSoundingWords)),
      );
      if (hasMatchingVerb) score += 1;

      // 목적어/주요 명사 비교
      const hasMatchingObject = spokenCore.objects.some(
        (obj: string) =>
          answerCore.objects.includes(obj) || answerCore.objects.some((answerObj: string) => isSimilarWord(obj, answerObj, similarSoundingWords)),
      );
      if (hasMatchingObject) score += 1;

      return score / maxScore; // 0에서 1 사이의 유사도 점수
    };

    // 단어가 유사한지 확인하는 함수
    const isSimilarWord = (word1: string, word2: string, similarDict: Record<string, string[]>) => {
      if (word1 === word2) return true;

      // 유사 단어 사전에서 확인
      if (similarDict[word1] && similarDict[word1].includes(word2)) return true;
      if (similarDict[word2] && similarDict[word2].includes(word1)) return true;

      return false;
    };

    // 유사도 점수 계산
    const similarityScore = calculateSimilarityScore(spokenCore, answerCore);

    // ! 문맥적 의미가 충분히 유사하다면 정답으로 처리
    if (similarityScore >= 0.8) {
      // 70% 이상 일치하면 정답으로 간주
      setFeedback(`정답입니다! (문맥적으로 같은 의미로 인정됨)`);
      handleSpeechResult(true);
      setIsVisible(true);
      return;
    }

    // 기존 단어별 비교 로직 수행 (보조적으로 사용)
    const spokenWords = normalizedSpoken.split(" ");
    const answerWords = normalizedAnswer.split(" ");

    let isMatch = true;
    let matchedSpokenWords = [...spokenWords];
    const unmatchedIndices: number[] = [];

    // 단어 수가 다르더라도 문맥이 유사할 수 있으므로 단어 수 차이만으로 틀렸다고 판단하지 않음
    // 대신 각 단어의 유사성을 개별적으로 체크

    // 각 단어 비교 로직
    // (기존 로직과 유사하지만 단어 수가 다른 경우도 처리)
    const maxWordIndex = Math.max(spokenWords.length, answerWords.length);
    let correctWordCount = 0;

    for (let i = 0; i < Math.min(spokenWords.length, answerWords.length); i++) {
      const spokenWord = spokenWords[i];
      const answerWord = answerWords[i];

      // 단어가 같으면 정답 단어 카운트 증가
      if (spokenWord === answerWord) {
        correctWordCount++;
        continue;
      }

      // 발음이 유사한 단어 목록 확인
      const similarWords = similarSoundingWords[answerWord] || [];

      if (similarWords.includes(spokenWord)) {
        // 발음이 유사한 단어는 정답으로 인정
        matchedSpokenWords[i] = answerWord;
        correctWordCount++;
      } else {
        // 유사한 단어가 아니면 불일치 표시
        unmatchedIndices.push(i);
      }
    }

    // 단어 일치율 계산
    const wordMatchRatio = correctWordCount / maxWordIndex;

    // ! 단어 일치율이 충분히 높으면 정답으로 간주
    if (wordMatchRatio >= 0.9) {
      // 80% 이상의 단어가 일치하면 정답으로 간주
      setFeedback("정답입니다! (단어 대부분이 일치합니다)");
      handleSpeechResult(true);
      setIsVisible(true);
      return;
    }

    // 차이점 찾기 (기존 로직 유지)
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
          // 발음이 유사한 단어인지 확인
          const similarWords = similarSoundingWords[answer[i]] || [];
          if (!similarWords.includes(spoken[i])) {
            differences.incorrect.push({
              spoken: spoken[i],
              correct: answer[i],
            });
          }
        }
      }

      return differences;
    };

    const diffs = findDifferences(spokenWords, answerWords);
    setDifferences(diffs);

    // 최종 판단
    if (diffs.missing.length === 0 && diffs.incorrect.length === 0) {
      setFeedback("정답입니다! (발음이 유사한 단어가 사용되었습니다)");
      handleSpeechResult(true);
    } else {
      setFeedback("❌ 다시 도전해 보세요.");
      handleSpeechResult(false);
    }
    // setIsVisible(true);
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
  const toggleAnswer = () => {
    setIsVisible(!isVisible);
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
            {/* 한글 문장 표시 */}
            <p>{currentSentence.ko}</p>

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
              hidden: feedback?.includes("정답"),
            })}>
            {/* 말하기 버튼 */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isPlaying || isButtonDisabled}
              className={clsx(
                "flex h-12 min-w-36 items-center justify-center gap-1 rounded-lg px-3 py-3 text-lg font-semibold text-white transition-all",
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
          {userSpoken && !isListening && !feedback?.includes("정답") && (
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
            {feedback?.includes("❌") && !isListening && (differences.missing.length > 0 || differences.incorrect.length > 0) && (
              <div className="mt-4 space-y-3">
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

      {/* 다음 퀴즈에 도전 버튼 */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            selectRandomSentence();
            setDifferences({ missing: [], incorrect: [] });
          }}
          disabled={isListening || isPlaying}
          className={clsx("btn btn-primary flex items-center justify-center gap-2 text-lg", {
            hidden: !feedback?.includes("정답"),
          })}>
          <span>다음 퀴즈에 도전</span>
          <FaArrowRight />
        </button>
      </div>

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoading })}>
        <Link href={"/dashboard"}>Back to My Dashboard</Link>
      </div>
    </div>
  );
}
