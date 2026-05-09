"use client";

import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { FadeInUp } from "@/components/motion/FadeInUp";
import { GradientBlob } from "@/components/motion/GradientBlob";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

export function HeroBanner() {
  return (
    <section
      className="relative isolate overflow-hidden border-b"
      style={{
        background:
          "radial-gradient(80% 60% at 80% 0%, rgba(11,95,255,0.18), transparent 60%), radial-gradient(60% 50% at 0% 100%, rgba(11,95,255,0.12), transparent 60%), linear-gradient(180deg, #ffffff, #f7f8fb)",
      }}
    >
      <GradientBlob className="-top-40 -left-32" size={520} opacity={0.4} duration={16} />
      <GradientBlob
        className="-bottom-40 -right-32"
        size={620}
        opacity={0.35}
        duration={20}
        color="var(--color-brand-200)"
      />
      <Container className="relative z-10 grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
        <div className="lg:col-span-7">
          <FadeInUp delay={0}>
            <Badge tone="brand" className="mb-4">
              Подключение за 1–3 дня
            </Badge>
          </FadeInUp>
          <FadeInUp delay={0.08}>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Гигабитный интернет, ТВ в 4K и мобильная связь — в одном договоре
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.18}>
            <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
              Rutega — оператор с собственной оптической сетью. Подключаем дома, офисы и целые
              бизнес-центры. Поддержка 24/7 без ботов, SLA 99.95% в договоре.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.28}>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/tariffs" size="lg">
                Выбрать тариф
              </LinkButton>
              <LinkButton href="#callback" size="lg" variant="secondary">
                Заказать звонок
              </LinkButton>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 text-sm">
              <div>
                <dt className="text-[var(--color-muted)]">Скорость до</dt>
                <dd className="text-2xl font-bold text-[var(--color-ink)]">
                  <AnimatedNumber value={1000} format={(n) => `${Math.round(n)}`} />
                  <span className="ml-1 text-base font-semibold">Мбит/с</span>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Доступность</dt>
                <dd className="text-2xl font-bold text-[var(--color-ink)]">
                  <AnimatedNumber
                    value={99.95}
                    format={(n) => n.toFixed(2).replace(/\.0+$/, "")}
                  />
                  %
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Поддержка</dt>
                <dd className="text-2xl font-bold text-[var(--color-ink)]">
                  <AnimatedNumber value={24} />
                  /<AnimatedNumber value={7} />
                </dd>
              </div>
            </dl>
          </FadeInUp>
        </div>
        <FadeInUp delay={0.2} className="relative flex lg:col-span-5">
          <div
            aria-hidden="true"
            className="animate-gradient-shift absolute inset-0 -z-10 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-700)] to-[var(--color-brand-800)] opacity-90"
          />
          <div className="flex w-full flex-col rounded-[var(--radius-xl)] p-8 text-white shadow-xl backdrop-blur">
            <p className="text-sm uppercase tracking-widest opacity-80">Хит весны</p>
            <p className="mt-2 text-3xl font-bold">Гига 1000</p>
            <p className="mt-1 opacity-90">1 Гбит/с + Wi-Fi 6 + антивирус</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                <AnimatedNumber value={890} />
                {" "}₽
              </span>
              <span className="opacity-80">/мес</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>· Бесплатное подключение</li>
              <li>· Wi-Fi 6 роутер бесплатно</li>
              <li>· Белый IP по запросу</li>
              <li>· Приоритетная поддержка</li>
            </ul>
            <LinkButton
              href="/services/home-internet"
              size="md"
              variant="secondary"
              className="mt-auto bg-white"
              fullWidth
            >
              Подробнее
            </LinkButton>
          </div>
        </FadeInUp>
      </Container>
    </section>
  );
}
