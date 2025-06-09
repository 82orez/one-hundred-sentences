// components/VoiceNotificationBadge.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import axios from "axios";
import clsx from "clsx";

type VoiceNotificationBadgeProps = {
  courseId: string;
  onClick?: () => void;
};

export default function VoiceNotificationBadge({ courseId, onClick }: VoiceNotificationBadgeProps) {
  const [newVoicesCount, setNewVoicesCount] = useState(0);
  const { data: session } = useSession();

  // 마지막으로 확인한 시간 가져오기 (로컬 스토리지에 저장)
  const getLastCheckTime = () => {
    if (typeof window === "undefined") return null;
    const lastCheck = localStorage.getItem(`voice-check-${courseId}-${session?.user?.id}`);
    return lastCheck ? new Date(lastCheck) : null;
  };

  // 마지막 확인 시간 설정
  const setLastCheckTime = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`voice-check-${courseId}-${session?.user?.id}`, new Date().toISOString());
    setNewVoicesCount(0);
  };

  // 새로운 음성 파일 수 조회
  const { data: initialCount } = useQuery({
    queryKey: ["newVoices", courseId, session?.user?.id],
    queryFn: async () => {
      const lastCheck = getLastCheckTime();
      const res = await axios.get(`/api/voice/new?courseId=${courseId}${lastCheck ? `&since=${lastCheck.toISOString()}` : ""}`);
      return res.data.count;
    },
    enabled: !!courseId && !!session?.user?.id,
  });

  useEffect(() => {
    if (initialCount) {
      setNewVoicesCount(initialCount);
    }
  }, [initialCount]);

  useEffect(() => {
    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // realtime 구독 설정
    const subscription = supabase
      .channel("my-voice-open-list-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "MyVoiceOpenList",
          filter: `courseId=eq.${courseId}`,
        },
        (payload) => {
          // 새 음성 파일이 추가될 때마다 카운트 증가
          setNewVoicesCount((prev) => prev + 1);
        },
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [courseId, session?.user?.id]);

  // 클릭 핸들러
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setLastCheckTime();
  };

  if (newVoicesCount === 0) return null;

  return (
    <div
      onClick={handleClick}
      className={clsx("badge badge-primary badge-sm ml-2 animate-pulse cursor-pointer", newVoicesCount > 9 ? "badge-lg" : "badge-md")}>
      {newVoicesCount > 99 ? "99+" : newVoicesCount}
    </div>
  );
}
