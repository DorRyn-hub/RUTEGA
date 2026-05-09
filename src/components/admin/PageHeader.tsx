import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function PageHeader({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="sm:shrink-0">
          <Button fullWidth className="sm:w-auto">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
