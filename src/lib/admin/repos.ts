import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import type {
  ServiceCreateInput,
  ServiceUpdateInput,
  TariffCreateInput,
  TariffUpdateInput,
  NewsCreateInput,
  NewsUpdateInput,
  UserAdminUpdateInput,
  BillCreateInput,
  BillUpdateInput,
  LeadUpdateInput,
} from "@/lib/validation/admin";

// Services
export async function adminListServices() {
  return prisma.service.findMany({ orderBy: { order: "asc" }, include: { tariffs: true } });
}
export async function adminGetService(id: string) {
  return prisma.service.findUnique({ where: { id }, include: { tariffs: true } });
}
export async function adminCreateService(input: ServiceCreateInput) {
  return prisma.service.create({
    data: {
      slug: input.slug,
      title: input.title,
      category: input.category,
      shortText: input.shortText,
      description: input.description,
      iconKey: input.iconKey,
      features: JSON.stringify(input.features ?? []),
      order: input.order ?? 0,
    },
  });
}
export async function adminUpdateService(id: string, input: ServiceUpdateInput) {
  return prisma.service.update({
    where: { id },
    data: {
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.shortText !== undefined && { shortText: input.shortText }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.iconKey !== undefined && { iconKey: input.iconKey }),
      ...(input.features !== undefined && { features: JSON.stringify(input.features) }),
      ...(input.order !== undefined && { order: input.order }),
    },
  });
}
export async function adminDeleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}

// Tariffs
export async function adminListTariffs() {
  return prisma.tariff.findMany({
    orderBy: [{ service: { order: "asc" } }, { order: "asc" }],
    include: { service: { select: { id: true, slug: true, title: true } } },
  });
}
export async function adminGetTariff(id: string) {
  return prisma.tariff.findUnique({ where: { id }, include: { service: true } });
}
export async function adminCreateTariff(input: TariffCreateInput) {
  return prisma.tariff.create({
    data: {
      serviceId: input.serviceId,
      slug: input.slug,
      title: input.title,
      speedMbps: input.speedMbps ?? null,
      priceRub: input.priceRub,
      perks: JSON.stringify(input.perks ?? []),
      highlight: input.highlight ?? false,
      order: input.order ?? 0,
    },
  });
}
export async function adminUpdateTariff(id: string, input: TariffUpdateInput) {
  return prisma.tariff.update({
    where: { id },
    data: {
      ...(input.serviceId !== undefined && { serviceId: input.serviceId }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.speedMbps !== undefined && { speedMbps: input.speedMbps }),
      ...(input.priceRub !== undefined && { priceRub: input.priceRub }),
      ...(input.perks !== undefined && { perks: JSON.stringify(input.perks) }),
      ...(input.highlight !== undefined && { highlight: input.highlight }),
      ...(input.order !== undefined && { order: input.order }),
    },
  });
}
export async function adminDeleteTariff(id: string) {
  return prisma.tariff.delete({ where: { id } });
}

// News
export async function adminListNews() {
  return prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" } });
}
export async function adminGetNews(id: string) {
  return prisma.newsItem.findUnique({ where: { id } });
}
export async function adminCreateNews(input: NewsCreateInput) {
  return prisma.newsItem.create({
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      publishedAt: input.publishedAt,
      cover: input.cover || null,
    },
  });
}
export async function adminUpdateNews(id: string, input: NewsUpdateInput) {
  return prisma.newsItem.update({
    where: { id },
    data: {
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.publishedAt !== undefined && { publishedAt: input.publishedAt }),
      ...(input.cover !== undefined && { cover: input.cover || null }),
    },
  });
}
export async function adminDeleteNews(id: string) {
  return prisma.newsItem.delete({ where: { id } });
}

// Users
const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  phone: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface UserQueryParams {
  q?: string;
  role?: "user" | "admin";
  status?: "active" | "banned";
  sort?: string; // "field.dir", e.g. "createdAt.desc"
  page?: number;
  limit?: number;
}

const USER_SORT_FIELDS = new Set([
  "fullName",
  "email",
  "username",
  "role",
  "status",
  "createdAt",
  "lastLoginAt",
]);

export async function adminQueryUsers(params: UserQueryParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const where: Record<string, unknown> = {};
  if (params.q) {
    const q = params.q.trim();
    if (q.length) {
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q.toLowerCase() } },
        { username: { contains: q.toLowerCase() } },
        { phone: { contains: q } },
      ];
    }
  }
  if (params.role) where.role = params.role;
  if (params.status) where.status = params.status;

  const [field = "createdAt", dir = "desc"] = (params.sort ?? "createdAt.desc").split(".");
  const sortField = USER_SORT_FIELDS.has(field) ? field : "createdAt";
  const sortDir: "asc" | "desc" = dir === "asc" ? "asc" : "desc";

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
      select: USER_SELECT,
    }),
    prisma.user.count({ where }),
  ]);
  return { rows, total, page, limit };
}

// Backwards-compat for any direct callers.
export async function adminListUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: USER_SELECT });
}

export async function adminGetUser(id: string) {
  return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
}
export async function adminUpdateUser(id: string, input: UserAdminUpdateInput) {
  const data: Record<string, unknown> = {};
  if (input.email !== undefined) data.email = input.email.toLowerCase();
  if (input.username !== undefined) data.username = input.username || null;
  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.phone !== undefined) data.phone = input.phone || null;
  if (input.role !== undefined) data.role = input.role;
  if (input.status !== undefined) data.status = input.status;
  if (input.password) data.passwordHash = await hashPassword(input.password);
  return prisma.user.update({ where: { id }, data, select: USER_SELECT });
}
export async function adminDeleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// Bills
export async function adminListBills() {
  return prisma.bill.findMany({
    orderBy: [{ period: "desc" }, { createdAt: "desc" }],
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });
}
export async function adminGetBill(id: string) {
  return prisma.bill.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });
}
export async function adminCreateBill(input: BillCreateInput) {
  return prisma.bill.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      status: input.status,
      period: input.period,
      paidAt: input.paidAt ?? null,
    },
  });
}
export async function adminUpdateBill(id: string, input: BillUpdateInput) {
  return prisma.bill.update({
    where: { id },
    data: {
      ...(input.userId !== undefined && { userId: input.userId }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.period !== undefined && { period: input.period }),
      ...(input.paidAt !== undefined && { paidAt: input.paidAt }),
    },
  });
}
export async function adminDeleteBill(id: string) {
  return prisma.bill.delete({ where: { id } });
}

// Leads
export async function adminListLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}
export async function adminGetLead(id: string) {
  return prisma.lead.findUnique({ where: { id } });
}
export async function adminUpdateLead(id: string, input: LeadUpdateInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.message !== undefined && { message: input.message || null }),
      ...(input.source !== undefined && { source: input.source }),
      ...(input.tariffSlug !== undefined && { tariffSlug: input.tariffSlug || null }),
    },
  });
}
export async function adminDeleteLead(id: string) {
  return prisma.lead.delete({ where: { id } });
}

// Dashboard metrics
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function bucketByDay(dates: Date[], days: number): number[] {
  const today = startOfDay(new Date());
  const buckets = new Array(days).fill(0);
  for (const d of dates) {
    const diffDays = Math.floor((today.getTime() - startOfDay(d).getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < days) buckets[days - 1 - diffDays] += 1;
  }
  return buckets;
}

function bucketSumByDay(rows: { date: Date; amount: number }[], days: number): number[] {
  const today = startOfDay(new Date());
  const buckets = new Array(days).fill(0);
  for (const r of rows) {
    const diffDays = Math.floor((today.getTime() - startOfDay(r.date).getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < days) buckets[days - 1 - diffDays] += r.amount;
  }
  return buckets;
}

export async function adminMetrics() {
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 86400000);
  const prev7 = new Date(now.getTime() - 14 * 86400000);
  const last30 = new Date(now.getTime() - 30 * 86400000);

  const [
    users,
    usersThis7,
    usersPrev7,
    services,
    tariffs,
    news,
    leads,
    leadsThis7,
    leadsPrev7,
    leadsNew,
    bills,
    outstanding,
    revenueThis7,
    revenuePrev7,
    revenueAll,
    activeServices,
    bannedUsers,
    last30Users,
    last30Leads,
    last30RevenueRows,
    topTariffsRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7 } } }),
    prisma.user.count({ where: { createdAt: { gte: prev7, lt: last7 } } }),
    prisma.service.count(),
    prisma.tariff.count(),
    prisma.newsItem.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: last7 } } }),
    prisma.lead.count({ where: { createdAt: { gte: prev7, lt: last7 } } }),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.bill.count(),
    prisma.bill.count({ where: { status: { in: ["due", "overdue"] } } }),
    prisma.bill.aggregate({
      _sum: { amount: true },
      where: { status: "paid", paidAt: { gte: last7 } },
    }),
    prisma.bill.aggregate({
      _sum: { amount: true },
      where: { status: "paid", paidAt: { gte: prev7, lt: last7 } },
    }),
    prisma.bill.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.userService.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "banned" } }),
    prisma.user.findMany({
      where: { createdAt: { gte: last30 } },
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: last30 } },
      select: { createdAt: true },
    }),
    prisma.bill.findMany({
      where: { status: "paid", paidAt: { gte: last30 } },
      select: { paidAt: true, amount: true },
    }),
    prisma.userService.groupBy({
      by: ["tariffSlug"],
      _count: { _all: true },
      orderBy: { _count: { tariffSlug: "desc" } },
      take: 5,
    }),
  ]);

  const topSlugs = topTariffsRaw.map((r) => r.tariffSlug);
  const tariffMeta = topSlugs.length
    ? await prisma.tariff.findMany({
        where: { slug: { in: topSlugs } },
        select: { slug: true, title: true, priceRub: true, service: { select: { title: true } } },
      })
    : [];
  const tariffMap = new Map(tariffMeta.map((t) => [t.slug, t]));
  const topTariffs = topTariffsRaw.map((r) => {
    const meta = tariffMap.get(r.tariffSlug);
    return {
      slug: r.tariffSlug,
      title: meta?.title ?? r.tariffSlug,
      service: meta?.service.title ?? "—",
      priceRub: meta?.priceRub ?? 0,
      count: r._count._all,
    };
  });

  return {
    users,
    services,
    tariffs,
    news,
    leads,
    bills,
    outstanding,
    leadsNew,
    activeServices,
    bannedUsers,
    revenuePaidTotal: revenueAll._sum.amount ?? 0,
    deltas: {
      users: { current: usersThis7, previous: usersPrev7 },
      leads: { current: leadsThis7, previous: leadsPrev7 },
      revenue: {
        current: revenueThis7._sum.amount ?? 0,
        previous: revenuePrev7._sum.amount ?? 0,
      },
    },
    series: {
      users: bucketByDay(
        last30Users.map((u) => u.createdAt),
        30,
      ),
      leads: bucketByDay(
        last30Leads.map((l) => l.createdAt),
        30,
      ),
      revenue: bucketSumByDay(
        last30RevenueRows
          .filter((b): b is { paidAt: Date; amount: number } => b.paidAt !== null)
          .map((b) => ({ date: b.paidAt, amount: b.amount })),
        30,
      ),
    },
    topTariffs,
  };
}

export type AdminActivityItem =
  | { kind: "user"; at: Date; title: string; subtitle: string; href: string }
  | { kind: "lead"; at: Date; title: string; subtitle: string; href: string }
  | { kind: "bill"; at: Date; title: string; subtitle: string; href: string };

export async function adminRecentActivity(limit = 12): Promise<AdminActivityItem[]> {
  const [users, leads, bills] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, fullName: true, email: true, createdAt: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, source: true, createdAt: true },
    }),
    prisma.bill.findMany({
      where: { paidAt: { not: null } },
      orderBy: { paidAt: "desc" },
      take: limit,
      select: {
        id: true,
        amount: true,
        paidAt: true,
        period: true,
        user: { select: { fullName: true, id: true } },
      },
    }),
  ]);

  const items: AdminActivityItem[] = [
    ...users.map(
      (u): AdminActivityItem => ({
        kind: "user",
        at: u.createdAt,
        title: `Регистрация: ${u.fullName}`,
        subtitle: u.email,
        href: `/admin/users/${u.id}/edit`,
      }),
    ),
    ...leads.map(
      (l): AdminActivityItem => ({
        kind: "lead",
        at: l.createdAt,
        title: `Заявка: ${l.name}`,
        subtitle: `источник: ${l.source}`,
        href: `/admin/leads`,
      }),
    ),
    ...bills.map(
      (b): AdminActivityItem => ({
        kind: "bill",
        at: b.paidAt ?? new Date(),
        title: `Оплачен счёт ${b.period}`,
        subtitle: `${b.user.fullName} · ${b.amount} ₽`,
        href: `/admin/bills/${b.id}/edit`,
      }),
    ),
  ];
  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items.slice(0, limit);
}
