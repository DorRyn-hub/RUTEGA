"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(15);
    const t1 = setTimeout(() => setProgress(60), 80);
    const t2 = setTimeout(() => setProgress(95), 320);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-[var(--color-brand-600)] shadow-[0_0_8px_var(--color-brand-300)]"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}
