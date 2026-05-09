import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserServices } from "@/lib/repos";
import { unauthorized, badRequest, fromZod, notFound } from "@/lib/api/respond";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const services = await getUserServices(user.id);
  return NextResponse.json({ services });
}

const connectSchema = z.object({ tariffSlug: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let payload;
  try {
    payload = connectSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  const tariff = await prisma.tariff.findUnique({
    where: { slug: payload.tariffSlug },
    select: { slug: true, serviceId: true },
  });
  if (!tariff) return notFound("Тариф не найден");

  const exists = await prisma.userService.findFirst({
    where: { userId: user.id, tariffSlug: tariff.slug },
  });
  if (exists) {
    return badRequest("Услуга уже подключена");
  }

  const created = await prisma.userService.create({
    data: {
      userId: user.id,
      serviceId: tariff.serviceId,
      tariffSlug: tariff.slug,
      status: "pending",
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let payload;
  try {
    payload = deleteSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  const result = await prisma.userService.deleteMany({
    where: { id: payload.id, userId: user.id },
  });
  if (result.count === 0) return notFound("Услуга не найдена");
  return NextResponse.json({ ok: true });
}
