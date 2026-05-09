import { describe, expect, it } from "vitest";
import {
  calculateQuote,
  clampSpeed,
  formatRub,
  type CalcInput,
} from "@/lib/calculator";

describe("calculator.clampSpeed", () => {
  it("возвращает 100 для нулевой/отрицательной/нечисловой скорости", () => {
    expect(clampSpeed(0)).toBe(100);
    expect(clampSpeed(-50)).toBe(100);
    expect(clampSpeed(NaN)).toBe(100);
  });

  it("ограничивает сверху значением 10000 Мбит/с", () => {
    expect(clampSpeed(50000)).toBe(10000);
  });

  it("округляет дробные значения", () => {
    expect(clampSpeed(123.7)).toBe(124);
  });
});

describe("calculator.calculateQuote", () => {
  it("интернет 100 Мбит/с — без скидки за скорость, без подключения", () => {
    const r = calculateQuote({ serviceType: "internet", speedMbps: 100, addons: [] });
    expect(r.monthlyKop).toBe(100 * 12_00);
    expect(r.oneOffKop).toBe(0);
    expect(r.perKbpsKop).toBe(12_00);
  });

  it("интернет 1000 Мбит/с — применяется коэффициент 0.7", () => {
    const r = calculateQuote({ serviceType: "internet", speedMbps: 1000, addons: [] });
    // 12_00 * 0.7 = 840 коп; 840 * 1000 = 840_000 коп = 8 400 ₽
    expect(r.perKbpsKop).toBe(840);
    expect(r.monthlyKop).toBe(840_000);
  });

  it("L2-VPN добавляет one-off за подключение", () => {
    const r = calculateQuote({ serviceType: "l2vpn", speedMbps: 200, addons: [] });
    expect(r.oneOffKop).toBe(35_000_00);
    expect(r.notes.some((n) => n.includes("филиал"))).toBe(true);
  });

  it("addons влияют на месяц и one-off", () => {
    const input: CalcInput = {
      serviceType: "internet",
      speedMbps: 200,
      addons: ["static_ip", "ddos_protection", "ip_telephony"],
    };
    const r = calculateQuote(input);
    // base = 200 * 1200 * 0.85 = 204_000; addons monthly = 500_00 + 8_000_00 + 1_500_00
    expect(r.monthlyKop).toBe(204_000 + 500_00 + 8_000_00 + 1_500_00);
    expect(r.oneOffKop).toBe(3_000_00);
  });

  it("радиоканал содержит соответствующее примечание", () => {
    const r = calculateQuote({ serviceType: "radio", speedMbps: 500, addons: [] });
    expect(r.notes.some((n) => n.toLowerCase().includes("радио"))).toBe(true);
  });

  it("colocation — month=аддоны, без скоростной составляющей", () => {
    const r = calculateQuote({
      serviceType: "colocation",
      speedMbps: 1000,
      addons: ["rack_unit", "rack_unit"],
    });
    expect(r.monthlyKop).toBe(2 * 6_500_00);
    expect(r.oneOffKop).toBe(15_000_00 + 2 * 5_000_00);
  });
});

describe("calculator.formatRub", () => {
  it("округляет копейки и форматирует с разделителем", () => {
    expect(formatRub(1234567)).toMatch(/12\s?346\s?₽/);
  });
});
