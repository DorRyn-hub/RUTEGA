const RUB_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const RUB_FORMATTER_KOP = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatRub(amount: number): string {
  return RUB_FORMATTER.format(amount);
}

export function formatKopAsRub(kop: number): string {
  return RUB_FORMATTER_KOP.format(kop / 100);
}

export function formatRubPerMonth(amount: number): string {
  return `${RUB_FORMATTER.format(amount)}/мес`;
}

export function formatDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return DATE_FORMATTER.format(d);
}

export function formatDateTime(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return DATE_TIME_FORMATTER.format(d);
}

export function formatRelative(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  const diffMs = Date.now() - d.getTime();
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  if (minutes < 1) return past ? "только что" : "сейчас";
  if (minutes < 60) return past ? `${minutes} мин назад` : `через ${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return past ? `${hours} ч назад` : `через ${hours} ч`;
  const days = Math.round(hours / 24);
  if (days < 30) return past ? `${days} дн назад` : `через ${days} дн`;
  return DATE_FORMATTER.format(d);
}

export function formatPeriod(period: string): string {
  // "2026-04" → "Апрель 2026"
  const [yearRaw, monthRaw] = period.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!year || !month || month < 1 || month > 12) return period;
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return `${months[month - 1]} ${year}`;
}
