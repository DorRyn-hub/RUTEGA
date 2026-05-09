import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatRubPerMonth } from "@/lib/format";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { HoverLift } from "@/components/motion/HoverLift";
import { cn } from "@/lib/cn";
import type { TariffDTO } from "@/types/domain";

interface TariffTableProps {
  tariffs: TariffDTO[];
  serviceSlug?: string;
}

export function TariffTable({ tariffs, serviceSlug }: TariffTableProps) {
  if (tariffs.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Тарифы для этой услуги пока не загружены.
      </p>
    );
  }

  return (
    <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tariffs.map((t) => {
        const slug = t.serviceSlug || serviceSlug || "";
        return (
          <StaggerItem key={t.id} className="h-full">
            <HoverLift className="h-full">
              <Card
                highlight={t.highlight}
                className={cn(
                  "flex h-full flex-col transition-shadow hover:shadow-lg",
                  t.highlight && "animate-slow-pulse [animation-duration:5s]",
                )}
                interactive
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t.title}</h3>
                  {t.highlight ? <Badge tone="brand">Хит</Badge> : null}
                </div>
                <p className="mb-4">
                  <span className="text-3xl font-bold">{formatRubPerMonth(t.priceRub)}</span>
                  {t.speedMbps ? (
                    <span className="ml-2 text-sm text-[var(--color-muted)]">
                      до {t.speedMbps} Мбит/с
                    </span>
                  ) : null}
                </p>
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                  {t.perks.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]"
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <LinkButton
                  href={`/services/${slug}#order`}
                  variant={t.highlight ? "primary" : "secondary"}
                  fullWidth
                >
                  Подключить
                </LinkButton>
              </Card>
            </HoverLift>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
