import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getTwoFactorStatus } from "@/lib/auth/twoFactor";
import { TwoFactorPanel } from "./TwoFactorPanel";

export const metadata: Metadata = {
  title: "Безопасность",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");
  const status = await getTwoFactorStatus(user.id);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Безопасность</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Двухфакторная аутентификация защищает учётную запись от компрометации пароля.
          Используйте Google Authenticator, 1Password, Bitwarden или любое TOTP-совместимое приложение.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Двухфакторная аутентификация (TOTP)</h2>
            <p className="text-sm text-[var(--color-muted)]">
              {status.enabled
                ? `Включена. Резервных кодов осталось: ${status.recoveryRemaining}.`
                : "Не подключена. Рекомендуем включить."}
            </p>
          </div>
          <Badge tone={status.enabled ? "success" : "warn"}>
            {status.enabled ? "Активна" : "Отключена"}
          </Badge>
        </div>
        <TwoFactorPanel enabled={status.enabled} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Что ещё рекомендуем</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <li>• Включите 2FA для всех сотрудников с доступом к биллингу.</li>
          <li>• Не используйте API-ключи на устройствах, которые не контролирует ИБ-служба.</li>
          <li>• Регулярно проверяйте журнал действий вашей организации.</li>
          <li>• При смене сотрудника удалите его из участников организации в разделе «Организация».</li>
        </ul>
      </Card>
    </div>
  );
}
