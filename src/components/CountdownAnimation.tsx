"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

interface CountdownUIProps {
  isActive: boolean;
  count: string | number;
}

export default function CountdownUI({ isActive, count }: CountdownUIProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className={clsx(
            "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform",
            "flex h-32 w-32 items-center justify-center rounded-full bg-green-500/50 text-4xl font-bold text-white shadow-lg",
          )}>
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {count}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
