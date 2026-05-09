import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized, badRequest, fromZod, serverError } from "@/lib/api/respond";

const profileSchema = z.object({
  fullName: z.string().min(2, "Укажите имя"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine(
      (v) => v === undefined || /^\+?[0-9 ()-]{7,20}$/.test(v),
      "Некорректный номер телефона",
    ),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let payload;
  try {
    payload = profileSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { fullName: payload.fullName, phone: payload.phone ?? null },
      select: { id: true, email: true, fullName: true, phone: true },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("profile update error", err);
    return serverError();
  }
}
