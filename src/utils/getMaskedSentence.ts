import nlp from "compromise";

export function getMaskedSentence(currentSentence: { en: string; ko: string; audioUrl: string; no: number } | null): string {
  if (!currentSentence) return "";

  const doc = nlp(currentSentence.en);

  // 각 단어 타입별로 추출
  const subjects = doc.match("#Noun").if("#Pronoun").out("array"); // 주어 (대명사 포함)
  const auxiliaries = doc.match("#Auxiliary").out("array"); // 조동사
  const beVerbs = doc.match("(am|is|are|was|were|be|being|been)").out("array"); // be 동사
  const questionWords = doc.match("(what|when|where|who|whom|whose|why|how)").out("array"); // 의문사
  const prepositions = doc.match("#Preposition").out("array"); // 전치사
  const pleaseWord = doc.match("please").out("array"); // please 단어

  // 항상 표시할 단어 목록
  const exceptionalWords = [
    "the",
    "a",
    "there",
    "here",
    "any",
    "some",
    "can",
    "many",
    "that",
    "this",
    "do",
    "does",
    "to",
    "please",
    "two",
    "and",
    "may",
    "only",
    "my",
    "books",
    "$20",
    "or",
    "vanilla",
    "There's",
    "locals",
    "should",
    "so",
    "all",
  ];

  // 항상 표시할 구문 목록 추가 (NEW)
  const alwaysShowPhrases = [
    "need to",
    "where the",
    "my name",
    "the City Center",
    // "could you please",
    // "thank you for",
    // "I would like",
    // 추가 구문들...
  ];

  // 항상 마스킹할 단어 목록 추가
  const alwaysMaskedWords = [
    "as",
    "where",
    "when",
    "from",
    // 추가 단어들...
  ];

  // 항상 마스킹할 구문 목록 추가
  const alwaysMaskedPhrases = [
    "how about",
    "for here",
    // "what if",
    // "rather than",
    // "instead of",
    // 추가 구문들...
  ];

  // 화면에 표시할 단어들의 집합
  const wordsToShow = [
    ...subjects,
    ...auxiliaries,
    ...beVerbs,
    ...questionWords,
    ...prepositions,
    ...pleaseWord,
    ...exceptionalWords, // 예외 단어 목록 추가
  ].map((w) => w.toLowerCase());

  // 원본 문장
  const originalSentence = currentSentence.en;

  // 먼저 항상 표시할 구문 처리 (NEW)
  let processedSentence = originalSentence;
  const visiblePhrasePositions = [];

  // 항상 표시할 구문의 위치를 찾아 저장
  alwaysShowPhrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    let match;

    while ((match = regex.exec(originalSentence)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      visiblePhrasePositions.push({
        start,
        end,
        phrase: match[0],
        type: "visible",
      });
    }
  });

  // 항상 마스킹할 구문 처리
  const maskedPhrasePositions = [];

  alwaysMaskedPhrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    let match;

    while ((match = regex.exec(originalSentence)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // 이미 항상 표시할 구문과 겹치는지 확인
      const isOverlapping = visiblePhrasePositions.some(
        (pos) => (start >= pos.start && start < pos.end) || (end > pos.start && end <= pos.end) || (start <= pos.start && end >= pos.end),
      );

      // 겹치지 않는 경우에만 마스킹할 구문으로 추가
      if (!isOverlapping) {
        maskedPhrasePositions.push({
          start,
          end,
          phrase: match[0],
          type: "masked",
        });
      }
    }
  });

  // 모든 구문 위치 정보를 시작 위치 기준으로 정렬
  const allPhrasePositions = [...visiblePhrasePositions, ...maskedPhrasePositions].sort((a, b) => a.start - b.start);

  // 구문 처리를 위한 임시 배열 생성
  const characters = originalSentence?.split("");

  // 구문별 처리 - 표시하거나 마스킹
  allPhrasePositions.forEach((pos) => {
    if (pos.type === "masked") {
      // 마스킹 처리
      for (let i = pos.start; i < pos.end; i++) {
        if (characters[i] !== " ") characters[i] = "_";
      }
    }
    // 표시할 구문은 그대로 유지
  });

  // 처리된 문장 생성
  processedSentence = characters?.join("");

  // 구문 처리 이후 단어별 처리
  const words = processedSentence?.split(" ");

  // 단어별로 구문 내부인지 확인하는 함수
  const isWordInPhrase = (wordIndex, wordLength) => {
    const wordStart = words.slice(0, wordIndex).join(" ").length + (wordIndex > 0 ? 1 : 0);
    const wordEnd = wordStart + wordLength;

    return allPhrasePositions.some(
      (pos) =>
        (wordStart >= pos.start && wordStart < pos.end) ||
        (wordEnd > pos.start && wordEnd <= pos.end) ||
        (wordStart <= pos.start && wordEnd >= pos.end),
    );
  };

  // 각 단어의 위치와 길이 계산
  let currentPosition = 0;
  const wordPositions = words?.map((word) => {
    const position = currentPosition;
    currentPosition += word.length + 1; // 단어 길이 + 공백 1
    return { word, position, length: word.length };
  });

  // 선택적으로 마스킹
  const maskedWords = words?.map((word, index) => {
    // 이미 마스킹된 부분(언더스코어만 있는)인지 확인
    if (/^_+$/.test(word)) {
      return word; // 이미 마스킹된 부분은 그대로 유지
    }

    // 단어가 어떤 구문 내에 있는지 확인
    const wordInPhrase = allPhrasePositions.find((pos) => {
      const wordStart = wordPositions[index].position;
      const wordEnd = wordStart + word.length;

      return (
        (wordStart >= pos.start && wordStart < pos.end) ||
        (wordEnd > pos.start && wordEnd <= pos.end) ||
        (wordStart <= pos.start && wordEnd >= pos.end)
      );
    });

    // 단어가 '표시할 구문' 내에 있으면 그대로 표시
    if (wordInPhrase && wordInPhrase.type === "visible") {
      return word;
    }

    // 단어가 '마스킹할 구문' 내에 있으면 마스킹
    if (wordInPhrase && wordInPhrase.type === "masked") {
      // 단어 끝에 구두점이 있는지 확인
      const punctuation = word.match(/[.,!?;:]$/);
      const cleanWord = punctuation ? word.slice(0, -1) : word;
      const maskedWord = "_".repeat(cleanWord.length);
      return punctuation ? maskedWord + punctuation[0] : maskedWord;
    }

    // 구문 내에 없는 단어들에 대한 처리

    // 단어 끝에 구두점이 있는지 확인
    const punctuation = word.match(/[.,!?;:]$/);
    const cleanWord = punctuation ? word.slice(0, -1) : word;

    // 반드시 마스킹해야 하는 단어인지 먼저 확인
    if (alwaysMaskedWords.includes(cleanWord.toLowerCase())) {
      const maskedWord = "_".repeat(cleanWord.length);
      return punctuation ? maskedWord + punctuation[0] : maskedWord;
    }

    // 표시해야 할 단어인지 확인 (wordsToShow 목록에 있거나 punctuation 만 있는 경우)
    if (
      wordsToShow.includes(cleanWord.toLowerCase()) ||
      word.match(/^[.,!?;:]+$/) // 문장 부호만으로 이루어진 경우
    ) {
      return word; // 있다면 그대로 표시
    }

    // 그 외의 단어는 마스킹 처리
    const maskedWord = "_".repeat(cleanWord.length);
    return punctuation ? maskedWord + punctuation[0] : maskedWord;
  });

  return maskedWords?.join(" ");
}
