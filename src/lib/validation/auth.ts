import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Минимум 8 символов")
  .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
  .regex(/[0-9]/, "Нужна хотя бы одна цифра");

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Введите e-mail или логин")
    .max(120, "Слишком длинное значение"),
  password: z.string().min(1, "Введите пароль"),
});

export const adminLoginSchema = z.object({
  identifier: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Укажите ваше имя"),
  email: z.string().min(1, "Введите e-mail").email("Некорректный e-mail"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine(
      (v) => v === undefined || /^\+?[0-9 ()-]{7,20}$/.test(v),
      "Некорректный номер телефона",
    ),
  password: passwordRule,
  consent: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласие на обработку персональных данных" }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
