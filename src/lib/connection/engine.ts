import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import { rubToKop } from "@/lib/billing/engine";
import type { ConnectionRequestDTO, ConnectionQuote } from "@/types/domain";

export type ConnectionServiceType =
  | "internet"
  | "l2vpn"
  | "mpls"
  | "hosting"
  | "colocation"
  | "other";

interface CreateRequestInput {
  organizationId?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  inn?: string;
  legalName?: string;
  address: string;
  lat?: number;
  lng?: number;
  serviceType: ConnectionServiceType;
  speedMbps?: number;
  desiredDate?: Date;
  notes?: string;
  actorId?: string;
}

export async function createConnectionRequest(input: CreateRequestInput) {
  const req = await prisma.connectionRequest.create({
    data: {
      organizationId: input.organizationId ?? null,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail ?? null,
      inn: input.inn ?? null,
      legalName: input.legalName ?? null,
      address: input.address,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      serviceType: input.serviceType,
      speedMbps: input.speedMbps ?? null,
      desiredDate: input.desiredDate ?? null,
      notes: input.notes ?? null,
      status: "new",
    },
  });
  await recordAudit({
    actorId: input.actorId,
    organizationId: input.organizationId ?? null,
    action: "connection.request.create",
    targetType: "ConnectionRequest",
    targetId: req.id,
    payload: {
      serviceType: input.serviceType,
      speedMbps: input.speedMbps ?? null,
    },
  });
  return req;
}

interface SurveyInput {
  requestId: string;
  availability: "available" | "partial" | "unavailable";
  notes?: string;
  actorId: string;
}

export async function recordSurvey(input: SurveyInput) {
  const req = await prisma.connectionRequest.update({
    where: { id: input.requestId },
    data: {
      surveyAvailability: input.availability,
      surveyNotes: input.notes ?? null,
      status: input.availability === "unavailable" ? "rejected" : "survey",
    },
  });
  await recordAudit({
    actorId: input.actorId,
    organizationId: req.organizationId,
    action: "connection.survey",
    targetType: "ConnectionRequest",
    targetId: req.id,
    payload: { availability: input.availability },
  });
  return req;
}

export interface QuoteCalcInput {
  serviceType: ConnectionServiceType;
  speedMbps?: number;
  distanceMeters?: number;
}

const BASE_INSTALL: Record<ConnectionServiceType, number> = {
  internet: 15000,
  l2vpn: 35000,
  mpls: 60000,
  hosting: 5000,
  colocation: 12000,
  other: 20000,
};

const BASE_MONTHLY_PER_MBPS: Record<ConnectionServiceType, number> = {
  internet: 35,
  l2vpn: 60,
  mpls: 110,
  hosting: 150,
  colocation: 80,
  other: 50,
};

export function calculateQuote(input: QuoteCalcInput): ConnectionQuote {
  const speed = input.speedMbps ?? 100;
  const distance = input.distanceMeters ?? 0;
  const oneOff =
    BASE_INSTALL[input.serviceType] + Math.max(0, distance - 200) * 350; // 350₽ за каждый м сверх 200м оптики
  const monthly = Math.max(2900, BASE_MONTHLY_PER_MBPS[input.serviceType] * speed);

  const items = [
    {
      title: `Подключение ${labelFor(input.serviceType)}${speed ? ` (${speed} Мбит/с)` : ""}`,
      amountKop: rubToKop(oneOff),
      recurring: false,
    },
    {
      title: `Абонентская плата ${labelFor(input.serviceType)} в месяц`,
      amountKop: rubToKop(monthly),
      recurring: true,
    },
  ];
  return {
    items,
    oneOffKop: rubToKop(oneOff),
    monthlyKop: rubToKop(monthly),
    sentAt: null,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
  };
}

function labelFor(t: ConnectionServiceType): string {
  switch (t) {
    case "internet":
      return "интернет";
    case "l2vpn":
      return "L2-VPN";
    case "mpls":
      return "MPLS";
    case "hosting":
      return "хостинг в ЦОД";
    case "colocation":
      return "размещение в ЦОД";
    default:
      return "услуга";
  }
}

export async function attachQuote(requestId: string, quote: ConnectionQuote, actorId: string) {
  const req = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: {
      status: "quoted",
      quote: JSON.stringify({ ...quote, sentAt: new Date().toISOString() }),
    },
  });
  await recordAudit({
    actorId,
    organizationId: req.organizationId,
    action: "connection.quote.send",
    targetType: "ConnectionRequest",
    targetId: req.id,
    payload: { oneOffKop: quote.oneOffKop, monthlyKop: quote.monthlyKop },
  });
  return req;
}

export async function changeRequestStatus(
  requestId: string,
  status: ConnectionRequestDTO["status"],
  actorId: string,
) {
  const req = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: { status },
  });
  await recordAudit({
    actorId,
    organizationId: req.organizationId,
    action: "connection.status",
    targetType: "ConnectionRequest",
    targetId: req.id,
    payload: { status },
  });
  return req;
}

export async function listConnectionRequests(params: {
  status?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 30));
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.organizationId) where.organizationId = params.organizationId;

  const [rows, total] = await Promise.all([
    prisma.connectionRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.connectionRequest.count({ where }),
  ]);
  const items: ConnectionRequestDTO[] = rows.map(toRequestDTO);
  return { items, total, page, limit };
}

export function toRequestDTO(r: {
  id: string;
  organizationId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  inn: string | null;
  legalName: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  serviceType: string;
  speedMbps: number | null;
  desiredDate: Date | null;
  notes: string | null;
  status: string;
  surveyAvailability: string | null;
  surveyNotes: string | null;
  quote: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ConnectionRequestDTO {
  let quote: ConnectionQuote | null = null;
  if (r.quote) {
    try {
      const parsed = JSON.parse(r.quote);
      if (parsed && typeof parsed === "object") quote = parsed as ConnectionQuote;
    } catch {}
  }
  return {
    id: r.id,
    organizationId: r.organizationId,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    contactEmail: r.contactEmail,
    inn: r.inn,
    legalName: r.legalName,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    serviceType: r.serviceType,
    speedMbps: r.speedMbps,
    desiredDate: r.desiredDate ? r.desiredDate.toISOString() : null,
    notes: r.notes,
    status: r.status as ConnectionRequestDTO["status"],
    surveyAvailability: r.surveyAvailability,
    surveyNotes: r.surveyNotes,
    quote,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
