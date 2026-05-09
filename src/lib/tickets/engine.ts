import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import type { TicketDTO, TicketMessageDTO } from "@/types/domain";

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

interface SlaWindow {
  respondHours: number;
  resolveHours: number;
}

const PRIORITY_SLA: Record<TicketPriority, SlaWindow> = {
  low: { respondHours: 24, resolveHours: 72 },
  normal: { respondHours: 8, resolveHours: 48 },
  high: { respondHours: 2, resolveHours: 16 },
  urgent: { respondHours: 1, resolveHours: 4 },
};

export function slaWindow(priority: TicketPriority): SlaWindow {
  return PRIORITY_SLA[priority];
}

interface CreateTicketInput {
  organizationId: string | null;
  openedById: string;
  subject: string;
  category?: string;
  priority?: TicketPriority;
  body: string;
}

export async function createTicket(input: CreateTicketInput) {
  const priority = input.priority ?? "normal";
  const sla = slaWindow(priority);
  const now = new Date();

  const last = await prisma.ticket.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (last?.number ?? 1000) + 1;

  const ticket = await prisma.ticket.create({
    data: {
      number: nextNumber,
      organizationId: input.organizationId,
      openedById: input.openedById,
      subject: input.subject,
      category: input.category ?? "general",
      priority,
      status: "open",
      slaRespondAt: new Date(now.getTime() + sla.respondHours * 3600_000),
      slaResolveAt: new Date(now.getTime() + sla.resolveHours * 3600_000),
      messages: {
        create: {
          authorId: input.openedById,
          body: input.body,
          isInternal: false,
        },
      },
    },
  });

  await recordAudit({
    actorId: input.openedById,
    organizationId: input.organizationId ?? null,
    action: "ticket.create",
    targetType: "Ticket",
    targetId: ticket.id,
    payload: { subject: input.subject, priority, number: nextNumber },
  });

  return ticket;
}

interface AddMessageInput {
  ticketId: string;
  authorId: string;
  body: string;
  isInternal?: boolean;
  authorIsCustomer?: boolean;
}

export async function addTicketMessage(input: AddMessageInput) {
  const ticket = await prisma.ticket.findUnique({ where: { id: input.ticketId } });
  if (!ticket) throw new Error("Тикет не найден");
  const isStaffReply = !input.authorIsCustomer && !input.isInternal;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (isStaffReply && !ticket.firstResponseAt) {
    updates.firstResponseAt = new Date();
  }
  if (input.authorIsCustomer && ticket.status === "waiting_customer") {
    updates.status = "in_progress";
  }
  if (isStaffReply && ticket.status === "open") {
    updates.status = "in_progress";
  }
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      ...updates,
      messages: {
        create: {
          authorId: input.authorId,
          body: input.body,
          isInternal: input.isInternal ?? false,
        },
      },
    },
  });
  await recordAudit({
    actorId: input.authorId,
    organizationId: ticket.organizationId ?? null,
    action: input.isInternal ? "ticket.note" : "ticket.reply",
    targetType: "Ticket",
    targetId: ticket.id,
    payload: { isInternal: input.isInternal ?? false },
  });
}

interface ChangeStatusInput {
  ticketId: string;
  status: TicketStatus;
  actorId: string;
}

export async function changeTicketStatus(input: ChangeStatusInput) {
  const t = await prisma.ticket.findUnique({ where: { id: input.ticketId } });
  if (!t) throw new Error("Тикет не найден");
  const updates: Record<string, unknown> = { status: input.status };
  if (input.status === "resolved") updates.resolvedAt = new Date();
  if (input.status === "closed") updates.closedAt = new Date();
  await prisma.ticket.update({ where: { id: t.id }, data: updates });
  await recordAudit({
    actorId: input.actorId,
    organizationId: t.organizationId ?? null,
    action: "ticket.status",
    targetType: "Ticket",
    targetId: t.id,
    payload: { from: t.status, to: input.status },
  });
}

export async function assignTicket(ticketId: string, assigneeId: string | null, actorId: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: assigneeId },
  });
  await recordAudit({
    actorId,
    action: "ticket.assign",
    targetType: "Ticket",
    targetId: ticketId,
    payload: { assigneeId },
  });
}

export async function listOrgTickets(organizationId: string): Promise<TicketDTO[]> {
  const rows = await prisma.ticket.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      openedBy: { select: { id: true, fullName: true } },
      assignedTo: { select: { id: true, fullName: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, fullName: true, role: true } } },
      },
    },
  });
  return rows.map(toTicketDTO);
}

export async function listAllTickets(params: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: TicketDTO[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 30));
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  const [rows, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        organization: { select: { id: true, legalName: true, shortName: true } },
        openedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, fullName: true, role: true } } },
        },
      },
    }),
    prisma.ticket.count({ where }),
  ]);
  return {
    items: rows.map((r) => ({
      ...toTicketDTO(r),
      organizationName:
        r.organization?.shortName ?? r.organization?.legalName ?? null,
    })),
    total,
  };
}

export async function getTicket(ticketId: string): Promise<TicketDTO | null> {
  const t = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      organization: { select: { id: true, legalName: true, shortName: true } },
      openedBy: { select: { id: true, fullName: true } },
      assignedTo: { select: { id: true, fullName: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, fullName: true, role: true } } },
      },
    },
  });
  if (!t) return null;
  return {
    ...toTicketDTO(t),
    organizationName: t.organization?.shortName ?? t.organization?.legalName ?? null,
  };
}

interface TicketRow {
  id: string;
  number: number;
  organizationId: string | null;
  openedById: string;
  openedBy: { id: string; fullName: string };
  assignedToId: string | null;
  assignedTo: { id: string; fullName: string } | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  slaRespondAt: Date;
  slaResolveAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    authorId: string;
    body: string;
    isInternal: boolean;
    createdAt: Date;
    author: { id: string; fullName: string; role: string };
  }[];
}

function toTicketDTO(t: TicketRow): TicketDTO {
  const messages: TicketMessageDTO[] = t.messages.map((m) => ({
    id: m.id,
    authorId: m.authorId,
    authorName: m.author.fullName,
    authorRole: m.author.role,
    body: m.body,
    isInternal: m.isInternal,
    createdAt: m.createdAt.toISOString(),
  }));
  return {
    id: t.id,
    number: t.number,
    organizationId: t.organizationId,
    openedById: t.openedById,
    openedByName: t.openedBy.fullName,
    assignedToId: t.assignedToId,
    assignedToName: t.assignedTo?.fullName ?? null,
    subject: t.subject,
    category: t.category,
    priority: t.priority as TicketPriority,
    status: t.status as TicketStatus,
    slaRespondAt: t.slaRespondAt.toISOString(),
    slaResolveAt: t.slaResolveAt.toISOString(),
    firstResponseAt: t.firstResponseAt ? t.firstResponseAt.toISOString() : null,
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messages,
  };
}
