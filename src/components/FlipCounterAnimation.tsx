// components/FlipCounter.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipCounterProps {
  value: number;
  className?: string;
}

export default function FlipCounter({ value, className = "" }: FlipCounterProps) {
  // NaN 체크를 추가하여 기본값 설정 (예: 0)
  const safeValue = isNaN(value) ? 0 : value;
  const [displayValue, setDisplayValue] = useState(safeValue);

  useEffect(() => {
    // 값이 변경될 때도 NaN 체크
    setDisplayValue(isNaN(value) ? 0 : value);
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
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="inline-block">
        {/* NaN이 발생할 경우 문자열로 변환하거나 기본값 표시 */}
        {String(displayValue)}
      </motion.div>
    </div>
  );
}
