"use client";

import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { FadeInUp } from "@/components/motion/FadeInUp";
import { GradientBlob } from "@/components/motion/GradientBlob";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

const stats = [
  { label: "Доступность", value: 99.99, suffix: "%", format: (n: number) => n.toFixed(2) },
  { label: "Клиентов", value: 1200, suffix: "+", format: (n: number) => `${Math.round(n)}` },
  { label: "Поддержка", value: 24, suffix: "/7", format: (n: number) => `${Math.round(n)}` },
];

export function HeroBanner() {
  return (
    <section
      className="relative isolate overflow-hidden border-b"
      style={{
        background:
          "radial-gradient(80% 60% at 80% 0%, rgba(59,16,123,0.14), transparent 60%), radial-gradient(60% 50% at 0% 100%, rgba(80,90,167,0.10), transparent 60%), linear-gradient(180deg, #ffffff, #f7f8fb)",
      }}
    >
      <GradientBlob
        className="-top-40 -left-32"
        size={520}
        opacity={0.35}
        duration={18}
        color="var(--color-brand-200)"
      />
      <GradientBlob
        className="-bottom-40 -right-32"
        size={620}
        opacity={0.28}
        duration={22}
        color="var(--color-brand-300)"
      />

      <Container className="relative z-10 grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
        {/* Left column */}
        <div className="lg:col-span-7">
          <FadeInUp delay={0}>
            <Badge tone="brand" className="mb-4">
              Только для юридических лиц
            </Badge>
          </FadeInUp>

          <FadeInUp delay={0.08}>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Корпоративный интернет
              <br />и сетевая инфраструктура
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #3B107B, #505AA7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                для вашего бизнеса
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.18}>
            <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">
              Rutega — B2B интернет-провайдер с собственной оптической сетью в Москве. Выделенные
              каналы, IP-транзит, MPLS VPN и сетевая безопасность. SLA{" "}
              <span className="font-semibold text-[var(--color-ink)]">99.99%</span> закреплён в
              договоре.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.28}>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contacts#order" size="lg">
                Подать заявку
              </LinkButton>
              <LinkButton href="/tariffs" size="lg" variant="secondary">
                Тарифы и цены
              </LinkButton>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <dl className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t pt-8 text-sm sm:grid-cols-3 sm:gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[var(--color-muted)]">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-[var(--color-ink)]">
                    <AnimatedNumber value={s.value} format={s.format} />
                    <span className="ml-0.5 text-base font-semibold">{s.suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </FadeInUp>
        </div>

        {/* Right card */}
        <FadeInUp delay={0.2} className="relative flex lg:col-span-5">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-[var(--radius-xl)]"
            style={{
              background: "linear-gradient(145deg, #3B107B, #505AA7)",
            }}
          />
          <div className="flex w-full flex-col rounded-[var(--radius-xl)] p-8 text-white shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
              Популярный тариф
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight">Business 500</p>
            <p className="mt-1 text-sm opacity-85">
              500 Мбит/с симметрично · /29 подсеть · SLA 99.95%
            </p>

            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-black">
                <AnimatedNumber value={9900} format={(n) => Math.round(n).toLocaleString("ru-RU")} />
                {" "}₽
              </span>
              <span className="text-sm opacity-75">/мес</span>
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Симметричный выделенный канал",
                "Подсеть /29 — 6 IP-адресов",
                "Резервный канал включён",
                "SLA 99.95% с компенсациями",
                "NOC 24/7, реакция 1 час",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 opacity-90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white opacity-60" />
                  {item}
                </li>
              ))}
            </ul>

            <LinkButton
              href="/contacts#order"
              size="md"
              variant="secondary"
              className="mt-auto bg-white text-[var(--color-brand-700)] hover:bg-white/90"
              fullWidth
            >
              Подключить
            </LinkButton>
          </div>
        </FadeInUp>
      </Container>
    </section>
  );
}
