"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function Timer({ expiresAt, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // 한국 시간 기준으로 계산
      const now = new Date();
      const expireDate = new Date(expiresAt);

      // 한국 시간 오프셋 적용 (UTC+9)
      const koreaOffset = 9 * 60 * 60 * 1000;
      const nowKorea = new Date(now.getTime() + koreaOffset);
      const expireDateKorea = new Date(expireDate.getTime() + koreaOffset);

      const difference = expireDateKorea.getTime() - nowKorea.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft(null);
        setIsExpired(true);
        onExpire?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="text-center">
        <span className="font-semibold text-red-600">만료됨</span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const getTimerColor = () => {
    if (timeLeft.days === 0 && timeLeft.hours < 2) {
      return "text-red-600"; // 2시간 미만
    } else if (timeLeft.days === 0 && timeLeft.hours < 12) {
      return "text-orange-600"; // 12시간 미만
    } else if (timeLeft.days <= 1) {
      return "text-yellow-600"; // 1일 이하
    }
    return "text-gray-700"; // 정상
  };

  return (
    <div className="text-center text-lg">
      <div className="mt-1 mb-1 text-gray-500">{timeLeft.days > 0 ? "마감까지 남은 시간" : "마감 임박"}</div>
      <div className={`font-semibold ${getTimerColor()}`}>
        D -{timeLeft.days > 0 && <span className="inline-block min-w-[2rem]">{timeLeft.days}일</span>}{" "}
        <span className="inline-block min-w-[2rem]">{timeLeft.hours.toString().padStart(2, "0")}시간</span>{" "}
        <span className="inline-block min-w-[2rem]">{timeLeft.minutes.toString().padStart(2, "0")}분</span>{" "}
        <span className="inline-block min-w-[2rem]">{timeLeft.seconds.toString().padStart(2, "0")}초</span>
      </div>
    </div>
  );
}
