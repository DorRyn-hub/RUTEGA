import "server-only";
import { prisma } from "@/lib/prisma";

interface InvoiceRenderInput {
  number: string;
  period: string;
  issuedAt: Date;
  dueAt: Date;
  totalKop: number;
  vatKop: number;
  items: { description: string; amountKop: number }[];
  organizationId: string;
}

const RUB = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
});

function fmt(kop: number): string {
  return RUB.format(kop / 100);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const PROVIDER_DETAILS = {
  legalName: "ООО «Рутега»",
  inn: "7701234567",
  kpp: "770101001",
  ogrn: "1027700000000",
  address: "Москва, ул. Тверская, д. 12",
  bank: "АО «Тинькофф Банк»",
  bik: "044525974",
  account: "40702810100000123456",
  corrAccount: "30101810145250000974",
};

export function renderInvoiceHtml(input: InvoiceRenderInput): string {
  const itemsHtml = input.items
    .map(
      (it) => `
    <tr>
      <td>${escapeHtml(it.description)}</td>
      <td style="text-align: right; white-space: nowrap;">${fmt(it.amountKop)}</td>
    </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Счёт ${escapeHtml(input.number)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 14px; color: #111; padding: 32px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  .muted { color: #666; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f7f7f7; text-align: left; }
  .totals { margin-top: 16px; text-align: right; }
  .totals .row { display: flex; justify-content: flex-end; gap: 24px; padding: 4px 0; }
  .totals .grand { font-size: 18px; font-weight: 700; }
  .meta { display: flex; justify-content: space-between; gap: 24px; margin-top: 16px; }
  .meta div { width: 48%; }
  .label { font-weight: 600; }
</style>
</head>
<body>
  <h1>Счёт на оплату № ${escapeHtml(input.number)}</h1>
  <p class="muted">Период: ${escapeHtml(input.period)} · Выставлен: ${fmtDate(input.issuedAt)} · Оплатить до: ${fmtDate(input.dueAt)}</p>

  <div class="meta">
    <div>
      <p class="label">Поставщик</p>
      <p>${escapeHtml(PROVIDER_DETAILS.legalName)}<br/>
      ИНН ${escapeHtml(PROVIDER_DETAILS.inn)} · КПП ${escapeHtml(PROVIDER_DETAILS.kpp)}<br/>
      ${escapeHtml(PROVIDER_DETAILS.address)}<br/>
      ${escapeHtml(PROVIDER_DETAILS.bank)} · БИК ${escapeHtml(PROVIDER_DETAILS.bik)}<br/>
      Р/с ${escapeHtml(PROVIDER_DETAILS.account)}<br/>
      К/с ${escapeHtml(PROVIDER_DETAILS.corrAccount)}</p>
    </div>
    <div>
      <p class="label">Покупатель</p>
      <p class="muted">ID организации: ${escapeHtml(input.organizationId)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Услуга</th>
        <th style="text-align: right;">Сумма, ₽</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>В т.ч. НДС 20%:</span><span>${fmt(input.vatKop)}</span></div>
    <div class="row grand"><span>Итого к оплате:</span><span>${fmt(input.totalKop)}</span></div>
  </div>

  <p class="muted" style="margin-top: 32px;">
    При оплате укажите номер счёта и ИНН плательщика. Оригиналы документов будут направлены через систему ЭДО (Диадок/СБИС/Контур) после её подключения.
  </p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function getRenderedInvoice(invoiceId: string): Promise<string | null> {
  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return null;
  if (inv.htmlSnapshot) return inv.htmlSnapshot;
  // legacy без snapshot — отрендерим из проводок
  const charges = await prisma.charge.findMany({ where: { invoiceId: inv.id } });
  return renderInvoiceHtml({
    number: inv.number,
    period: inv.period,
    issuedAt: inv.issuedAt,
    dueAt: inv.dueAt,
    totalKop: inv.totalKop,
    vatKop: inv.vatKop,
    items: charges.map((c) => ({ description: c.description, amountKop: c.amountKop })),
    organizationId: inv.accountId,
  });
}
