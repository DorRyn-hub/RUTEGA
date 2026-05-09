import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: "1.0",
    description: "Rutega B2B Customer Portal API",
    auth: {
      type: "ApiKey",
      headers: ["Authorization: Bearer <key>", "X-Api-Key: <key>"],
      keysIssuedIn: "/lk/api-keys",
      scopes: ["read", "write", "billing", "tickets"],
    },
    endpoints: [
      { method: "GET", path: "/api/v1/status", scope: null, summary: "Публичный статус компонентов и инцидентов" },
      { method: "GET", path: "/api/v1/account", scope: "read", summary: "ЛС, баланс, инвойсы организации" },
      { method: "GET", path: "/api/v1/services", scope: "read", summary: "Список активных услуг с тарифами и площадками" },
      { method: "GET", path: "/api/v1/tickets", scope: "read", summary: "Тикеты организации" },
      { method: "POST", path: "/api/v1/tickets", scope: "tickets", summary: "Открыть тикет" },
      { method: "GET", path: "/api/v1/incidents", scope: "read", summary: "Активные и недавние инциденты" },
      { method: "POST", path: "/api/v1/connection-requests", scope: "write", summary: "Создать заявку на подключение" },
    ],
    rateLimit: {
      perKey: "60 req/min",
      note: "не реализовано в MVP — будет накручено через Redis",
    },
  });
}
