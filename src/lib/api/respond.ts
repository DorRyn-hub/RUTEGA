import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status: 400 });
}

export function unauthorized(message = "Требуется авторизация") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Доступ запрещён") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Не найдено") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function tooManyRequests(retryAfterMs: number) {
  return NextResponse.json(
    { error: "Слишком много запросов. Попробуйте позже." },
    { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
  );
}

export function serverError() {
  return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
}

export function fromZod(err: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".");
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return badRequest("Проверьте корректность данных", fields);
}
