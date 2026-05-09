import { NextRequest } from "next/server";
import { adminQueryUsers } from "@/lib/admin/repos";
import { getAdminUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/respond";
import { buildXlsxResponse, type XlsxColumn } from "@/lib/admin/xlsx";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminQueryUsers>>["rows"][number];

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const role = (sp.get("role") as "user" | "admin" | null) ?? undefined;
  const status = (sp.get("status") as "active" | "banned" | null) ?? undefined;

  const { rows } = await adminQueryUsers({
    q: q ?? undefined,
    role: role ?? undefined,
    status: status ?? undefined,
    page: 1,
    limit: 10000,
  });

  const columns: XlsxColumn<Row>[] = [
    { header: "ID", key: "id", value: (u) => u.id, width: 28 },
    { header: "Имя", key: "fullName", value: (u) => u.fullName, width: 28 },
    { header: "E-mail", key: "email", value: (u) => u.email, width: 30 },
    { header: "Логин", key: "username", value: (u) => u.username ?? "", width: 18 },
    { header: "Телефон", key: "phone", value: (u) => u.phone ?? "", width: 20 },
    { header: "Роль", key: "role", value: (u) => u.role, width: 10 },
    { header: "Статус", key: "status", value: (u) => u.status, width: 14 },
    {
      header: "Последний вход",
      key: "lastLoginAt",
      value: (u) => (u.lastLoginAt ? u.lastLoginAt : ""),
      width: 22,
      numFmt: "dd.mm.yyyy hh:mm",
    },
    {
      header: "Создан",
      key: "createdAt",
      value: (u) => u.createdAt,
      width: 22,
      numFmt: "dd.mm.yyyy hh:mm",
    },
  ];

  const filename = `rutega-users-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return buildXlsxResponse({
    filename,
    sheetName: "Пользователи",
    rows,
    columns,
  });
}
