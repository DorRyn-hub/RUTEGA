import { z } from "zod";

export const contactSchema = z.object({
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
  message: z.string().max(1000, "Сообщение слишком длинное").optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласие на обработку персональных данных" }),
  }),
  consentMarketing: z.boolean().optional(),
  captchaToken: z.string().optional(),
  // honeypot — should be empty
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
