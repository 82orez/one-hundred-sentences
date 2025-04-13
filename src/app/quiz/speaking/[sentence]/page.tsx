"use client";

import { use } from "react";
import SpeakingQuizComponent from "@/components/SpeakingQuizComponent";
// 훅 자체를 가져와서 전달하는 대신 결과값만 사용
import { useNativeAudioAttempt } from "@/hooks/useNativeAudioAttempt";

type Props = {
  params: Promise<{ sentence: string }>;
};

export default function SpeakingPage({ params }: Props) {
  const { sentence } = use(params);
  const currentSentenceNumber = parseInt(sentence, 10);
  // 훅을 직접 호출하여 mutation 객체 생성
  const nativeAudioAttemptMutation = useNativeAudioAttempt();

  return (
    <SpeakingQuizComponent
      currentSentenceNumber={currentSentenceNumber}
      // 기존 useNativeAudioAttempt 대신 nativeAudioAttemptMutation 전달
      nativeAudioAttemptMutation={nativeAudioAttemptMutation}
      showNavigation={true}
    />
  );
}
