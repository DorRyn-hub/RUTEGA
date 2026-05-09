import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside
        aria-hidden="true"
        className="hidden flex-col justify-between p-12 text-white lg:flex"
        style={{
          background:
            "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-600) 60%, var(--color-brand-800) 100%)",
        }}
      >
        <Logo href="/" className="text-white" />
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Личный кабинет Rutega
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            Управляйте услугами, оплачивайте счета, получайте поддержку и подключайте новые
            тарифы — всё в одном месте.
          </p>
          <ul className="mt-8 space-y-2 text-white/90">
            <li>· Прозрачная история платежей</li>
            <li>· Подключение и отключение услуг в один клик</li>
            <li>· Приоритетная техподдержка</li>
          </ul>
        </div>
        <p className="text-sm text-white/70">© {new Date().getFullYear()} Rutega</p>
      </aside>
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo href="/" />
            <Link href="/" className="text-sm text-[var(--color-muted)] hover:underline">
              На главную
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
