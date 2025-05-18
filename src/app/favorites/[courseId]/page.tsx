"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, Bookmark, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { motion } from "framer-motion";
import { useNativeAudioAttempt } from "@/hooks/useNativeAudioAttempt";
import clsx from "clsx";
import Link from "next/link";

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
      <h1 className="mb-6 flex items-center justify-center text-2xl font-bold">
        <Heart className="mr-2 text-red-500" size={24} />내 즐겨찾기 문장 목록
      </h1>

      {favoriteSentences?.length === 0 ? (
        <div className="py-10 text-center">
          <Bookmark className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">즐겨찾기한 문장이 없습니다.</p>
          <button
            onClick={() => router.push(`/dashboard/${courseId}`)}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
            문장 학습하러 가기
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {favoriteSentences?.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="mb-2 flex items-start justify-between">
                <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {item.sentenceNo}번 문장
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

              {item.sentence?.audioUrl && (
                <button
                  onClick={() => playAudio(item.sentence.no, item.sentence.audioUrl)}
                  disabled={(currentlyPlaying !== null && currentlyPlaying !== item.sentence.no) || isPlayingNativeAudio}
                  className={`flex items-center text-sm ${
                    currentlyPlaying !== null && currentlyPlaying !== item.sentence.no
                      ? "cursor-not-allowed text-gray-400"
                      : "text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  }`}>
                  <span className="mr-1">🔊</span>
                  {currentlyPlaying === item.sentence.no ? "재생 중..." : "발음 듣기"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": isLoading })}>
        <Link href={`/dashboard/${courseId}`}>Back to My Dashboard</Link>
      </div>
    </div>
  );
}
