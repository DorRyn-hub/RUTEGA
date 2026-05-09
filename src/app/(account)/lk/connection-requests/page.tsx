import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { listConnectionRequests } from "@/lib/connection/engine";
import { formatDateTime, formatKopAsRub } from "@/lib/format";
import { hasPermission } from "@/lib/auth/permissions";
import { NewConnectionRequestForm } from "./NewConnectionRequestForm";

export const metadata: Metadata = {
  title: "Заявки на подключение",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: "warn" | "info" | "success" | "danger" | "neutral" }> = {
  new: { label: "Новая", tone: "warn" },
  survey: { label: "Тех. обследование", tone: "info" },
  quoted: { label: "Выставлен КП", tone: "info" },
  accepted: { label: "Принято", tone: "success" },
  rejected: { label: "Отказано", tone: "danger" },
  active: { label: "Подключено", tone: "success" },
};

const SERVICE_LABEL: Record<string, string> = {
  internet: "Интернет",
  l2vpn: "L2-VPN",
  mpls: "MPLS",
  hosting: "Хостинг в ЦОД",
  colocation: "Размещение в ЦОД",
  other: "Другое",
};

export default async function ConnectionRequestsPage() {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Заявки на подключение</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Раздел доступен после привязки к организации.
        </p>
      </Card>
    );
  }
  const { items } = await listConnectionRequests({ organizationId: ctx.org.id });
  const canWrite = hasPermission(ctx.role, "connection.write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Заявки на подключение</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Подайте заявку на новый офис, склад или ЦОД-площадку. Мы проведём тех. обследование и пришлём КП с расчётом подключения и абонентской платы.
        </p>
      </header>

      {canWrite && <NewConnectionRequestForm />}

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Адрес</th>
              <th className="px-5 py-3 font-medium">Услуга</th>
              <th className="px-5 py-3 font-medium">Скорость</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">КП</th>
              <th className="px-5 py-3 font-medium">Создана</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const status = STATUS_LABEL[r.status] ?? { label: r.status, tone: "neutral" as const };
              return (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{r.address}</p>
                    {r.surveyNotes && (
                      <p className="text-xs text-[var(--color-muted)]">{r.surveyNotes}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">{SERVICE_LABEL[r.serviceType] ?? r.serviceType}</td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">
                    {r.speedMbps ? `${r.speedMbps} Мбит/с` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {r.quote ? (
                      <span>
                        Подключение: <strong>{formatKopAsRub(r.quote.oneOffKop)}</strong>
                        <br />
                        В мес: <strong>{formatKopAsRub(r.quote.monthlyKop)}</strong>
                      </span>
                    ) : (
                      <span className="text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                    {formatDateTime(r.createdAt)}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Пока заявок нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
