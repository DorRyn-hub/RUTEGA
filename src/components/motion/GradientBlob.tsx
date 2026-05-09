import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface Props {
  className?: string;
  color?: string;
  size?: number;
  opacity?: number;
  duration?: number;
}

export function GradientBlob({
  className,
  color = "var(--color-brand-300)",
  size = 480,
  opacity = 0.45,
  duration = 14,
}: Props) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: `radial-gradient(circle at 30% 30%, ${color}, transparent 65%)`,
    opacity,
    ["--blob-duration" as string]: `${duration}s`,
  };
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl animate-blob-drift",
        className,
      )}
      style={style}
    />
  );
}
