import Script from "next/script";

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void;
  }
}

/**
 * Отправить цель в Метрику. Если счётчик не инициализирован — no-op.
 * Вызывать в onSubmit/onClick форм и важных кнопок.
 */
export function trackGoal(
  goal: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!id || typeof window.ym !== "function") return;
  try {
    window.ym(Number(id), "reachGoal", goal, params);
  } catch {
    /* noop */
  }
}

export function YandexMetrika() {
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!id) return null;
  return (
    <>
      <Script id="ym-loader" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${id}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
