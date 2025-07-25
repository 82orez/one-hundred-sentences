"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, Bookmark, Trash2, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { motion } from "framer-motion";
import { useNativeAudioAttempt } from "@/hooks/useNativeAudioAttempt";
import clsx from "clsx";
import Link from "next/link";
import { getDisplaySentenceNumber } from "@/utils/getDisplaySentenceNumber";

// 즐겨찾기 문장 타입 정의
interface FavoriteSentence {
  id: string;
  sentenceNo: number;
  sentence: {
    no: number;
    en: string;
    ko: string;
    audioUrl?: string;
  };
  createdAt: string;
}

type Props = {
  params: Promise<{ courseId: string }>;
};

export default function FavoriteSentencesPage({ params }: Props) {
  const { courseId } = use(params);

  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPlayingNativeAudio, setIsPlayingNativeAudio] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // 현재 재생 중인 오디오의 문장 번호를 저장하는 상태 추가
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  // 정렬 방향 상태 추가 (true: 오름차순, false: 내림차순)
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const recordNativeAudioAttemptMutation = useNativeAudioAttempt();

  // 인증 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/sign-in");
      return;
    }
  }, [status, router]);

  // ✅ 즐겨찾기 문장 데이터 가져오기
  const {
    data: favoriteSentences,
    isLoading,
    error,
    refetch,
  } = useQuery<FavoriteSentence[]>({
    queryKey: ["favoriteSentences", session?.user?.id, courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/favorites/favorites-page?courseId=${courseId}`);
      return res.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id && !!courseId,
  });

  // ✅ 즐겨찾기 삭제 함수
  const handleRemoveFavorite = async (sentenceNo: number) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/favorites/favorites-page?sentenceNo=${sentenceNo}&courseId=${courseId}`);
      // 데이터 다시 불러오기
      refetch();
    } catch (error) {
      console.error("즐겨찾기 삭제 중 오류 발생:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ 오디오 재생 함수
  const playAudio = (sentenceNo: number, audioUrl?: string) => {
    if (!audioUrl) return;

    // 현재 재생 중인 오디오가 있으면 중지
    if (currentlyPlaying !== null) {
      // 선택적: 기존 오디오 중지 로직 추가
    }

    setIsPlayingNativeAudio(true);

    // 현재 재생 중인 오디오를 설정
    setCurrentlyPlaying(sentenceNo);

    recordNativeAudioAttemptMutation.mutate({ sentenceNo, courseId });

    const audio = new Audio(audioUrl);

    // * 재생 속도 설정
    audio.playbackRate = 0.8;

    // 오디오 재생이 끝나면 상태 초기화
    audio.onended = () => {
      setIsPlayingNativeAudio(false);
      setCurrentlyPlaying(null);
    };

    audio.play();
  };

  // ✅ 정렬 방향 전환 함수
  const toggleSortDirection = () => {
    setSortAscending(!sortAscending);
  };

  // ✅ 문장 번호순으로 정렬된 데이터
  const sortedSentences = favoriteSentences
    ? [...favoriteSentences].sort((a, b) => {
        return sortAscending ? a.sentenceNo - b.sentenceNo : b.sentenceNo - a.sentenceNo;
      })
    : [];

  if (status === "loading" || isLoading) {
    return <LoadingPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">즐겨찾기 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 flex items-center justify-center text-2xl font-bold">
        <Heart className="mr-2 text-red-500" size={24} />내 즐겨찾기 문장 목록
      </h1>

      {/* 정렬 버튼 추가 */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={toggleSortDirection}
          className="flex items-center rounded-md bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800">
          {sortAscending ? (
            <>
              <ArrowDownAZ className="mr-1" size={16} /> 번호 오름차순
            </>
          ) : (
            <>
              <ArrowUpZA className="mr-1" size={16} /> 번호 내림차순
            </>
          )}
        </button>
      </div>

      {sortedSentences.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="mt-4 rounded-lg border border-gray-400 bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-2 flex items-start justify-between">
            <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {getDisplaySentenceNumber(item.sentenceNo)}번 문장
            </span>
            <button
              onClick={() => handleRemoveFavorite(item.sentence.no)}
              disabled={isDeleting || currentlyPlaying !== null}
              className="text-gray-500 transition-colors hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>

          <p className="mb-2 text-lg font-medium">{item.sentence?.en}</p>
          <p className="mb-3 text-gray-600 dark:text-gray-400">{item.sentence?.ko}</p>

          <div className="flex items-center justify-between">
            {item.sentence?.audioUrl && (
              <button
                onClick={() => playAudio(item.sentence.no, item.sentence.audioUrl)}
                disabled={(currentlyPlaying !== null && currentlyPlaying !== item.sentence.no) || isPlayingNativeAudio}
                className={`flex items-center text-sm ${
                  currentlyPlaying !== null && currentlyPlaying !== item.sentence.no
                    ? "cursor-not-allowed text-gray-400"
                    : "cursor-pointer text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                }`}>
                <span className="mr-1">🔊</span>
                {currentlyPlaying === item.sentence.no ? "재생 중..." : "발음 듣기"}
              </button>
            )}

            <button
              onClick={() => router.push(`/learn/${Math.ceil(getDisplaySentenceNumber(item.sentenceNo) / 5)}`)}
              className="cursor-pointer rounded-md bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700">
              학습하러 가기
            </button>
          </div>
        </motion.div>
      ))}

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoading })}>
        <Link href={`/dashboard/${courseId}`}>Back to My Dashboard</Link>
      </div>
    </div>
  );
}
