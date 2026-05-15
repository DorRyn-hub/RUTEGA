import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Вход в Личный кабинет",
  description: "Авторизация для управления услугами Rutega.",
  alternates: { canonical: "/lk/login" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Вход в Личный кабинет</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Нет учётной записи?{" "}
        <Link href="/lk/register" className="font-semibold text-[var(--color-brand-700)] hover:underline">
          Зарегистрироваться
        </Link>
      </p>
      <LoginForm from={from} />
    </div>
  );
}
