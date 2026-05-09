import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] py-16">
      <Container className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
          Ошибка 404
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Страница не найдена</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          Возможно, страница была перемещена или вы перешли по устаревшей ссылке. Вернитесь на
          главную или загляните в каталог услуг.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/">На главную</LinkButton>
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-brand-600)] bg-white px-5 text-base font-semibold text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]"
          >
            Посмотреть услуги
          </Link>
        </div>
      </Container>
    </main>
  );
}
