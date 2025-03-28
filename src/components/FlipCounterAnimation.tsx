// components/FlipCounter.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipCounterProps {
  value: number;
  className?: string;
}

export default function FlipCounter({ value, className = "" }: FlipCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        key={displayValue} // 값이 바뀔 때마다 새 애니메이션
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{
          type: "tween",
          duration: 0.8, // 원하는 초 단위 지속 시간 (예: 0.8초)
          ease: "easeInOut", // 선택적 이징 함수
        }}
        className="inline-block">
        {displayValue}
      </motion.div>
    </div>
  );
}
