import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ServiceDTO } from "@/types/domain";

export function ServiceCard({ service }: { service: ServiceDTO }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block focus:outline-none"
      aria-label={`Услуга «${service.title}»`}
    >
      <Card interactive className="flex h-full flex-col gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
          <Icon name={service.iconKey} className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{service.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{service.shortText}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-700)] transition-transform group-hover:translate-x-0.5">
          Подробнее
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </Card>
    </Link>
  );
}
