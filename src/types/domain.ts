export type ServiceCategory =
  | "internet"
  | "tv"
  | "mobile"
  | "business"
  | "security"
  | "smart-home";

export interface ServiceDTO {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  shortText: string;
  description: string;
  iconKey: string;
  features: string[];
  slaUptime: number;
  slaResponseHours: number;
  slaResolveHours: number;
  order: number;
  tariffs: TariffDTO[];
}

export interface TariffDTO {
  id: string;
  slug: string;
  serviceSlug: string;
  title: string;
  speedMbps: number | null;
  priceRub: number;
  perks: string[];
  highlight: boolean;
  order: number;
}

export interface NewsItemDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  cover: string | null;
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  username?: string | null;
  role?: string;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillDTO {
  id: string;
  amount: number;
  status: "paid" | "due" | "overdue";
  period: string;
  paidAt: string | null;
  createdAt: string;
}

export interface UserServiceDTO {
  id: string;
  serviceSlug: string;
  serviceTitle: string;
  tariffSlug: string;
  tariffTitle: string;
  priceRub: number;
  status: "active" | "paused" | "pending";
  startedAt: string;
  siteId?: string | null;
  siteTitle?: string | null;
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

// ============================================================================
//  B2B portal DTOs
// ============================================================================

export type OrgRole = "director" | "accountant" | "tech" | "viewer";

export interface OrganizationDTO {
  id: string;
  inn: string;
  kpp: string | null;
  ogrn: string | null;
  legalName: string;
  shortName: string | null;
  legalAddress: string;
  postalAddress: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  twoFactorRequired: boolean;
  accountManager?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface OrganizationMemberDTO {
  id: string;
  userId: string;
  role: OrgRole;
  position: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  acceptedAt: string | null;
}

export interface SiteDTO {
  id: string;
  title: string;
  address: string;
  lat: number | null;
  lng: number | null;
  status: string;
}

export interface AccountSummaryDTO {
  id: string;
  number: string;
  balanceKop: number;
  creditLimitKop: number;
  billingMode: string;
  currency: string;
  monthlyChargeKop: number;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  period: string;
  totalKop: number;
  vatKop: number;
  status: "issued" | "paid" | "overdue" | "cancelled";
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface PaymentDTO {
  id: string;
  amountKop: number;
  method: string;
  externalRef: string | null;
  note: string | null;
  createdAt: string;
}

export interface ChargeDTO {
  id: string;
  period: string;
  amountKop: number;
  source: string;
  description: string;
  invoiceId: string | null;
  createdAt: string;
}

export interface IncidentDTO {
  id: string;
  serviceId: string | null;
  serviceTitle: string | null;
  title: string;
  summary: string;
  severity: "minor" | "major" | "critical" | "maintenance";
  componentSlugs: string[];
  affectedOrgIds: string[];
  startedAt: string;
  resolvedAt: string | null;
  publicRfo: string | null;
  isPublic: boolean;
  updates: { id: string; status: string; message: string; createdAt: string }[];
}

export interface CompensationDTO {
  id: string;
  incidentId: string;
  organizationId: string;
  period: string;
  amountKop: number;
  reason: string;
  applied: boolean;
  createdAt: string;
}

export interface StatusComponentDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  group: string | null;
  currentStatus: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
  order: number;
}

export interface TicketDTO {
  id: string;
  number: number;
  organizationId: string | null;
  organizationName?: string | null;
  openedById: string;
  openedByName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  subject: string;
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  slaRespondAt: string;
  slaResolveAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessageDTO[];
}

export interface TicketMessageDTO {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ConnectionRequestDTO {
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
  desiredDate: string | null;
  notes: string | null;
  status:
    | "new"
    | "survey"
    | "quoted"
    | "accepted"
    | "rejected"
    | "active";
  surveyAvailability: string | null;
  surveyNotes: string | null;
  quote: ConnectionQuote | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionQuote {
  items: { title: string; amountKop: number; recurring: boolean }[];
  oneOffKop: number;
  monthlyKop: number;
  sentAt: string | null;
  validUntil: string | null;
}

export interface AuditLogDTO {
  id: string;
  actorId: string | null;
  actorName: string | null;
  organizationId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiKeyDTO {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CaseMetric {
  label: string;
  value: string;
}

export interface CaseDTO {
  id: string;
  slug: string;
  clientName: string;
  clientLogoUrl: string | null;
  industry: string;
  segment: "b2b" | "b2g";
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  techStack: string[];
  metrics: CaseMetric[];
  publishedAt: string;
  cover: string | null;
  order: number;
}

export type CoverageType = "optic" | "radio" | "pop";

export interface CoveragePointDTO {
  id: string;
  type: CoverageType;
  title: string | null;
  lat: number | null;
  lng: number | null;
  geojson: unknown | null;
  metadata: Record<string, unknown> | null;
}

export interface CoverageFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry:
      | { type: "Point"; coordinates: [number, number] }
      | { type: string; coordinates: unknown };
    properties: {
      type: CoverageType;
      title: string | null;
      metadata: Record<string, unknown> | null;
    };
  }>;
}

export interface NpsResponseDTO {
  id: string;
  organizationId: string | null;
  userId: string | null;
  score: number;
  comment: string | null;
  createdAt: string;
}
