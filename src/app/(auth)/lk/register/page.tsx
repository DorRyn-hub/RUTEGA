import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Регистрация в Личном кабинете",
  description: "Создание учётной записи для управления услугами Rutega.",
  alternates: { canonical: "/lk/register" },
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Создать учётную запись</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/lk/login" className="font-semibold text-[var(--color-brand-700)] hover:underline">
          Войти
        </Link>
      </p>
      <RegisterForm />
    </div>
  );
}
