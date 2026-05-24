"use client";

import { motion } from "framer-motion";

const coins = [
  "left-[8%] top-[18%] h-14 w-14",
  "left-[78%] top-[16%] h-10 w-10",
  "left-[68%] top-[70%] h-16 w-16",
  "left-[18%] top-[76%] h-9 w-9",
  "left-[88%] top-[48%] h-12 w-12"
];

export function FloatingCoins() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((coin, index) => (
        <motion.div
          key={coin}
          className={`coin-face absolute rounded-full ${coin}`}
          animate={{ y: [0, -20, 0], rotate: [0, 16, -8, 0] }}
          transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
