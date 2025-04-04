// src/utils/checkSpeakingAnswer.ts
import nlp from "compromise";

interface SentenceType {
  en: string;
  ko: string;
  audioUrl: string;
  no: number;
}

interface Differences {
  missing: string[];
  incorrect: { spoken: string; correct: string }[];
}

export const checkAnswer = (
  transcript: string,
  currentSentence: SentenceType,
  handleSpeechResult: (isCorrect: boolean) => void,
  setFeedback: (feedback: string | null) => void,
  setDifferences: (differences: Differences) => void,
  setIsVisible: (isVisible: boolean) => void,
) => {
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

  const normalizedSpoken = normalizeText(transcript);
  const normalizedAnswer = normalizeText(currentSentence.en);

  // 단어 수 확인
  const spokenWordCount = normalizedSpoken.split(" ").length;
  const answerWordCount = normalizedAnswer.split(" ").length;

  console.log("📝 Normalized 말한 내용:", normalizedSpoken);
  console.log("✅ 정답:", normalizedAnswer);

  // 두 문장이 완전히 같으면 바로 정답 처리
  if (normalizedSpoken === normalizedAnswer) {
    setFeedback("정답입니다!");
    handleSpeechResult(true);
    setIsVisible(true);
    return true;
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
    "you're": ["your", "you are", "you"],
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
    "bus card": ["postcard"],
    "is your": ["is there"],

    // 의미적으로 유사한 단어/표현 추가
    good: ["great", "nice", "excellent", "perfect", "wonderful", "terrific"],
    bad: ["terrible", "awful", "poor", "not good"],
    big: ["large", "huge", "enormous", "gigantic"],
    small: ["little", "tiny", "petite"],
    happy: ["glad", "pleased", "delighted", "content"],
    sad: ["unhappy", "upset", "depressed", "down"],
  };

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

  // 문맥적 의미가 충분히 유사하다면 정답으로 처리
  if (similarityScore >= 0.8 && spokenWordCount >= answerWordCount) {
    // 70% 이상 일치하면 정답으로 간주
    console.log("similarityScore: ", similarityScore);
    setFeedback(`정답입니다! (문맥적으로 같은 의미로 인정됨)`);
    handleSpeechResult(true);
    setIsVisible(true);
    return true;
  }

  // 기존 단어별 비교 로직 수행 (보조적으로 사용)
  const spokenWords = normalizedSpoken.split(" ");
  const answerWords = normalizedAnswer.split(" ");

  const unmatchedIndices: number[] = [];

  // 각 단어 비교 로직
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
      correctWordCount++;
    } else {
      // 유사한 단어가 아니면 불일치 표시
      unmatchedIndices.push(i);
    }
  }

  // 단어 일치율 계산
  const wordMatchRatio = correctWordCount / maxWordIndex;

  // 단어 일치율이 충분히 높으면 정답으로 간주
  if (wordMatchRatio >= 0.9 && spokenWordCount >= answerWordCount) {
    // 80% 이상의 단어가 일치하면 정답으로 간주
    console.log("wordMatchRatio: ", wordMatchRatio);
    setFeedback("정답입니다! (단어 대부분이 일치합니다)");
    handleSpeechResult(true);
    setIsVisible(true);
    return true;
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
    setIsVisible(true);
    return true;
  } else {
    setFeedback("❌ 다시 도전해 보세요.");
    handleSpeechResult(false);
    return false;
  }
};
