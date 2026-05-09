import { z } from "zod";

const slug = z
  .string()
  .min(1, "Введите slug")
  .max(80)
  .regex(/^[a-z0-9-]+$/i, "Только латиница, цифры и дефисы");

const stringArray = z.array(z.string().min(1)).max(40);

export const serviceCreateSchema = z.object({
  slug,
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  shortText: z.string().min(1).max(280),
  description: z.string().min(1).max(2000),
  iconKey: z.string().min(1).max(40),
  features: stringArray.default([]),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});
export const serviceUpdateSchema = serviceCreateSchema.partial();

export const tariffCreateSchema = z.object({
  serviceId: z.string().min(1, "Выберите услугу"),
  slug,
  title: z.string().min(1).max(120),
  speedMbps: z
    .preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().int().min(0).nullable())
    .optional()
    .default(null),
  priceRub: z.coerce.number().int().min(0).max(10_000_000),
  perks: stringArray.default([]),
  highlight: z.coerce.boolean().default(false),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});
export const tariffUpdateSchema = tariffCreateSchema.partial();

export const newsCreateSchema = z.object({
  slug,
  title: z.string().min(1).max(180),
  excerpt: z.string().min(1).max(400),
  body: z.string().min(1),
  publishedAt: z
    .string()
    .min(1)
    .transform((v) => new Date(v)),
  cover: z.string().url().or(z.literal("")).optional().nullable(),
});
export const newsUpdateSchema = z.object({
  slug: slug.optional(),
  title: z.string().min(1).max(180).optional(),
  excerpt: z.string().min(1).max(400).optional(),
  body: z.string().min(1).optional(),
  publishedAt: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  cover: z.string().url().or(z.literal("")).optional().nullable(),
});

export const userAdminUpdateSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(2).max(60).nullable().optional(),
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
  password: z.string().min(8).optional(),
});

export const billCreateSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().int(),
  status: z.enum(["paid", "due", "overdue"]),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Формат YYYY-MM"),
  paidAt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
});
export const billUpdateSchema = billCreateSchema.partial();

export const leadUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(1).max(40).optional(),
  email: z.string().email().or(z.literal("")).nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  source: z.string().min(1).max(40).optional(),
  tariffSlug: z.string().max(80).nullable().optional(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type TariffCreateInput = z.infer<typeof tariffCreateSchema>;
export type TariffUpdateInput = z.infer<typeof tariffUpdateSchema>;
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type UserAdminUpdateInput = z.infer<typeof userAdminUpdateSchema>;
export type BillCreateInput = z.infer<typeof billCreateSchema>;
export type BillUpdateInput = z.infer<typeof billUpdateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
