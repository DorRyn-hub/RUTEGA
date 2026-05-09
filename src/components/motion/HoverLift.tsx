"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  scale?: number;
  lift?: number;
}

export function HoverLift({ children, className, scale = 1.015, lift = 4 }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -lift, scale }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
