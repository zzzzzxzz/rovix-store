"use client";

import { motion } from "framer-motion";

export function RobloxHero() {
  return (
    <motion.div
      className="relative mx-auto h-[360px] w-full max-w-[430px] md:h-[500px]"
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-4 rounded-full bg-rovix-gold/25 blur-3xl animate-pulse-glow" />

      <motion.div
        className="relative z-10 mx-auto aspect-square w-full max-w-[350px] overflow-hidden rounded-[34px] border border-rovix-gold/30 bg-[#ffd000] shadow-gold md:max-w-[430px] md:rounded-[42px]"
        animate={{ y: [0, -10, 0], rotate: [-0.5, 0.5, -0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/rovix-mascot.png"
          alt="Mascote Rovix com Robux"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </motion.div>

      <motion.div
        className="coin-face absolute -right-1 top-14 z-20 h-16 w-16 rounded-full md:-right-4 md:top-16 md:h-20 md:w-20"
        animate={{ rotate: [0, 16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="coin-face absolute bottom-3 left-8 z-20 h-14 w-14 rounded-full md:bottom-8 md:left-2 md:h-18 md:w-18"
        animate={{ rotate: [0, -18, 0], y: [0, 10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="coin-face absolute bottom-12 right-6 z-20 h-12 w-12 rounded-full md:bottom-16 md:right-0 md:h-16 md:w-16"
        animate={{ rotate: [0, 22, 0], y: [0, -8, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
