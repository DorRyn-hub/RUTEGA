import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "warn" | "danger" | "success";
  delta?: { current: number; previous: number; format?: (n: number) => string };
  spark?: number[];
  href?: string;
}

function formatPercent(current: number, previous: number): { sign: 1 | 0 | -1; pct: number } {
  if (previous === 0 && current === 0) return { sign: 0, pct: 0 };
  if (previous === 0) return { sign: 1, pct: 100 };
  const diff = ((current - previous) / previous) * 100;
  return {
    sign: diff > 0.5 ? 1 : diff < -0.5 ? -1 : 0,
    pct: Math.round(Math.abs(diff)),
  };
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const w = 100;
  const h = 28;
  const max = Math.max(1, ...data);
  const step = w / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="mt-2 h-7 w-full text-[var(--color-brand-500)]"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatCard({ label, value, hint, tone = "default", delta, spark }: Props) {
  const valueColor =
    tone === "warn"
      ? "text-[var(--color-warn)]"
      : tone === "danger"
        ? "text-[var(--color-danger)]"
        : tone === "success"
          ? "text-[var(--color-success)]"
          : "text-[var(--color-ink)]";

  let deltaNode: React.ReactNode = null;
  if (delta) {
    const { sign, pct } = formatPercent(delta.current, delta.previous);
    const Icon = sign === 1 ? ArrowUp : sign === -1 ? ArrowDown : Minus;
    const color =
      sign === 1
        ? "text-[var(--color-success)]"
        : sign === -1
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-muted)]";
    deltaNode = (
      <span className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${color}`}>
        <Icon aria-hidden="true" className="h-3 w-3" />
        {pct}% за 7 дней
      </span>
    );
  }

  return (
    <Card className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      <span className={`font-display text-3xl font-bold ${valueColor}`}>{value}</span>
      {deltaNode}
      {hint ? <span className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</span> : null}
      {spark ? <Sparkline data={spark} /> : null}
    </Card>
  );
}
