// Прайсинг калькулятора стоимости подключения. Результат — ориентировочная цена «от».
// Точная стоимость считается менеджером после обследования адреса.

export type CalcServiceType = "internet" | "l2vpn" | "radio" | "colocation";

export type CalcAddon =
  | "static_ip"
  | "backup_channel"
  | "ddos_protection"
  | "ip_telephony"
  | "rack_unit";

export interface CalcInput {
  serviceType: CalcServiceType;
  speedMbps: number; // 100 .. 10000
  addons: CalcAddon[];
}

export interface CalcResult {
  monthlyKop: number; // ежемесячный платёж
  oneOffKop: number; // подключение
  perKbpsKop: number; // цена за 1 Мбит/с
  notes: string[];
}

// Базовые ставки в копейках. Округлено для удобства, реальная цена — индивидуальная.
const BASE_PER_MBIT_KOP: Record<CalcServiceType, number> = {
  internet: 12_00, // 12 ₽ за Мбит/с в составе пакета (демпфирующий коэффициент применяется ниже)
  l2vpn: 18_00,
  radio: 22_00,
  colocation: 0,
};

const SETUP_KOP: Record<CalcServiceType, number> = {
  internet: 0,
  l2vpn: 35_000_00,
  radio: 90_000_00,
  colocation: 15_000_00,
};

const ADDON_MONTHLY_KOP: Record<CalcAddon, number> = {
  static_ip: 500_00,
  backup_channel: 12_000_00,
  ddos_protection: 8_000_00,
  ip_telephony: 1_500_00,
  rack_unit: 6_500_00, // за юнит colocation в месяц
};

const ADDON_ONEOFF_KOP: Partial<Record<CalcAddon, number>> = {
  ip_telephony: 3_000_00,
  rack_unit: 5_000_00,
};

// Чем выше скорость, тем дешевле каждый Мбит — нелинейная скидка.
function speedDiscountFactor(speedMbps: number): number {
  if (speedMbps <= 100) return 1;
  if (speedMbps <= 500) return 0.85;
  if (speedMbps <= 1000) return 0.7;
  if (speedMbps <= 5000) return 0.5;
  return 0.4;
}

export function calculateQuote(input: CalcInput): CalcResult {
  const speed = clampSpeed(input.speedMbps);
  const baseRate = BASE_PER_MBIT_KOP[input.serviceType];
  const factor = speedDiscountFactor(speed);
  const perKbpsKop = Math.round(baseRate * factor);

  const speedMonthlyKop =
    input.serviceType === "colocation" ? 0 : Math.round(perKbpsKop * speed);

  const addonsMonthlyKop = input.addons.reduce(
    (sum, a) => sum + (ADDON_MONTHLY_KOP[a] ?? 0),
    0,
  );
  const addonsOneOffKop = input.addons.reduce(
    (sum, a) => sum + (ADDON_ONEOFF_KOP[a] ?? 0),
    0,
  );

  const notes: string[] = [];
  if (input.serviceType === "radio") {
    notes.push(
      "Радиоканал требует прямой видимости между точками. Точная цена — после обследования.",
    );
  }
  if (input.serviceType === "l2vpn") {
    notes.push("Цена указана за один филиал. Для нескольких точек — индивидуальный расчёт.");
  }
  if (input.serviceType === "colocation") {
    notes.push("Цена за юнит. Дополнительно — электропитание и трафик по отдельному тарифу.");
  }
  if (input.addons.includes("backup_channel")) {
    notes.push("Резервный канал — отдельная физическая трасса.");
  }

  return {
    monthlyKop: speedMonthlyKop + addonsMonthlyKop,
    oneOffKop: SETUP_KOP[input.serviceType] + addonsOneOffKop,
    perKbpsKop,
    notes,
  };
}

export function clampSpeed(speedMbps: number): number {
  if (!Number.isFinite(speedMbps) || speedMbps <= 0) return 100;
  if (speedMbps > 10000) return 10000;
  return Math.round(speedMbps);
}

export function formatRub(kop: number): string {
  const rub = Math.round(kop / 100);
  return new Intl.NumberFormat("ru-RU").format(rub) + " ₽";
}
