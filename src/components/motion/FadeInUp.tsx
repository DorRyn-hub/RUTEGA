import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeInUp({
  children,
  delay = 0,
  duration = 0.5,
  y = 8,
  className,
  style,
  ...rest
}: Props) {
  const cssVars = {
    "--fade-y": `${y}px`,
    animationDelay: delay ? `${delay}s` : undefined,
    animationDuration: `${duration}s`,
    ...style,
  } as CSSProperties;
  return (
    <div className={cn("animate-fade-in-up", className)} style={cssVars} {...rest}>
      {children}
    </div>
  );
}
