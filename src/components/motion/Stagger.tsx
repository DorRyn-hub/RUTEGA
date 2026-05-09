"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0.05,
  staggerChildren = 0.08,
  once = true,
}: ContainerProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: reduce ? 0 : delayChildren,
        staggerChildren: reduce ? 0 : staggerChildren,
      },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

export function StaggerItem({ children, className, y = 18 }: ItemProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
