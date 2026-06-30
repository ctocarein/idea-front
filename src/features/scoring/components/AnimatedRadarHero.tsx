"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AXES, type RadarScore } from "../types/scoring.types";
import { sampleScore } from "../lib/mock";
import { RadarChart } from "./RadarChart";

function randomScore(): RadarScore {
  const axes = {} as RadarScore["axes"];
  AXES.forEach((axis) => {
    // 3..9 : valeurs réalistes, jamais parfaites ni nulles
    axes[axis.key] = Math.round(Math.random() * 6) + 3;
  });
  return { gridVersion: "mock-v2", axes };
}

interface AnimatedRadarHeroProps {
  size?: number;
  interval?: number;
}

export function AnimatedRadarHero({ size = 440, interval = 2000 }: AnimatedRadarHeroProps) {
  const [score, setScore] = useState<RadarScore>(sampleScore);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScore(randomScore());
      setTick((t) => t + 1);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tick}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <RadarChart score={score} size={size} />
      </motion.div>
    </AnimatePresence>
  );
}
