import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toRequestDTO } from "@/lib/connection/engine";
import { formatDateTime, formatKopAsRub } from "@/lib/format";
import { ConnectionControls } from "./ConnectionControls";

export const metadata: Metadata = {
  title: "Админ · Заявка",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminConnectionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.connectionRequest.findUnique({ where: { id } });
  if (!row) notFound();
  const dto = toRequestDTO(row);

  return (
    <div className="space-y-5">
      <Link href="/admin/connection-requests" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Все заявки
      </Link>
      <PageHeader
        title={dto.legalName ?? dto.contactName}
        description={`Адрес: ${dto.address}`}
      />
      <Card className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Контакт</p>
          <p>{dto.contactName}</p>
          <p className="text-sm text-[var(--color-muted)]">
            {dto.contactPhone}
            {dto.contactEmail ? ` · ${dto.contactEmail}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Услуга</p>
          <p>{dto.serviceType}{dto.speedMbps ? ` · ${dto.speedMbps} Мбит/с` : ""}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">ИНН / Юр.лицо</p>
          <p>{dto.inn ?? "—"}</p>
          <p className="text-sm text-[var(--color-muted)]">{dto.legalName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Статус</p>
          <Badge tone="info">{dto.status}</Badge>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{formatDateTime(dto.createdAt)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Заметки клиента</p>
          <p className="mt-1 text-sm whitespace-pre-line">{dto.notes ?? "—"}</p>
        </div>
        {dto.surveyAvailability && (
          <div className="sm:col-span-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3 text-sm">
            <p className="font-medium">
              Тех. обследование: {dto.surveyAvailability}
            </p>
            {dto.surveyNotes && <p className="mt-1 text-[var(--color-muted)]">{dto.surveyNotes}</p>}
          </div>
        )}
        {dto.quote && (
          <div className="sm:col-span-2 rounded-[var(--radius-md)] border p-3 text-sm">
            <p className="font-medium">Коммерческое предложение</p>
            <ul className="mt-2 divide-y">
              {dto.quote.items.map((it, idx) => (
                <li key={idx} className="flex justify-between gap-3 py-1">
                  <span>{it.title}</span>
                  <span className="font-semibold">
                    {formatKopAsRub(it.amountKop)}
                    {it.recurring ? "/мес" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Подключение: <strong>{formatKopAsRub(dto.quote.oneOffKop)}</strong> · ежемесячно{" "}
              <strong>{formatKopAsRub(dto.quote.monthlyKop)}</strong>
              {dto.quote.validUntil ? ` · валидно до ${dto.quote.validUntil.slice(0, 10)}` : ""}
            </p>
          </div>
        )}
      </Card>
      <ConnectionControls
        requestId={dto.id}
        currentStatus={dto.status}
        serviceType={dto.serviceType}
        speedMbps={dto.speedMbps}
      />
    </div>
  );
}
