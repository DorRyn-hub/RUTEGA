import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z
    .string()
    .min(7, "Некорректный номер")
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Некорректный номер"),
  email: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine((v) => v === undefined || /.+@.+\..+/.test(v), "Некорректный e-mail"),
  message: z.string().max(2000, "Слишком длинный комментарий").optional(),
  inn: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine((v) => v === undefined || /^[0-9]{10}([0-9]{2})?$/.test(v), "ИНН: 10 или 12 цифр"),
  companyName: z.string().max(200).optional(),
  tariffSlug: z.string().optional(),
  source: z.enum(["callback", "tariff", "contact", "calculator"]).default("callback"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласие на обработку персональных данных" }),
  }),
  consentMarketing: z.boolean().optional(),
  captchaToken: z.string().optional(),
  // honeypot — should be empty
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
