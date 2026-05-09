import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { listOrgApiKeys } from "@/lib/api/keys";
import { hasPermission } from "@/lib/auth/permissions";
import { ApiKeysPanel } from "./ApiKeysPanel";

export const metadata: Metadata = {
  title: "API-ключи",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">API-ключи</h1>
        <p className="mt-2 text-[var(--color-muted)]">Раздел доступен после привязки к организации.</p>
      </Card>
    );
  }
  const keys = await listOrgApiKeys(ctx.org.id);
  const canManage = hasPermission(ctx.role, "api.write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">API-ключи</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Используйте API-ключи для интеграции вашего мониторинга и биллинговых систем с Rutega.
          Документация: <a className="underline" href="/api/v1" target="_blank">/api/v1</a>.
        </p>
      </header>

      {canManage && <ApiKeysPanel />}

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Название</th>
              <th className="px-5 py-3 font-medium">Префикс</th>
              <th className="px-5 py-3 font-medium">Скоупы</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Последнее использование</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">{k.name}</td>
                <td className="px-5 py-3 font-mono text-xs">{k.prefix}…</td>
                <td className="px-5 py-3 text-xs">
                  {k.scopes.map((s) => (
                    <span
                      key={s}
                      className="mr-1 rounded bg-[var(--color-bg)] px-2 py-0.5 text-[var(--color-muted)]"
                    >
                      {s}
                    </span>
                  ))}
                </td>
                <td className="px-5 py-3">
                  {k.revokedAt ? (
                    <Badge tone="danger">Отозван</Badge>
                  ) : (
                    <Badge tone="success">Активен</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {k.lastUsedAt ?? "ещё не использовался"}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Ключей пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
