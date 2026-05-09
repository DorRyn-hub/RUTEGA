"use client";

import { Container } from "@/components/ui/Container";
import { Button, LinkButton } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] py-16">
      <Container className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
          Что-то пошло не так
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Ошибка сервера</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          Мы уже знаем о проблеме и работаем над её решением. Попробуйте обновить страницу или
          вернуться на главную.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-[var(--color-muted)]">Идентификатор: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Повторить</Button>
          <LinkButton href="/" variant="secondary">
            На главную
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
