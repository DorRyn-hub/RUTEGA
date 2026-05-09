-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inn" TEXT NOT NULL,
    "kpp" TEXT,
    "ogrn" TEXT,
    "legalName" TEXT NOT NULL,
    "shortName" TEXT,
    "legalAddress" TEXT NOT NULL,
    "postalAddress" TEXT,
    "bankDetails" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accountManagerId" TEXT,
    "twoFactorRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Organization_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" TEXT,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Site_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "balanceKop" INTEGER NOT NULL DEFAULT 0,
    "creditLimitKop" INTEGER NOT NULL DEFAULT 0,
    "billingMode" TEXT NOT NULL DEFAULT 'postpay',
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amountKop" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "invoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Charge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Charge_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amountKop" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "externalRef" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalKop" INTEGER NOT NULL,
    "vatKop" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "htmlSnapshot" TEXT,
    "edoExternalId" TEXT,
    CONSTRAINT "Invoice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT,
    "currentStatus" TEXT NOT NULL DEFAULT 'operational',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceIncident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "componentSlugs" TEXT NOT NULL DEFAULT '[]',
    "affectedOrgIds" TEXT NOT NULL DEFAULT '[]',
    "startedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "publicRfo" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceIncident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncidentUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IncidentUpdate_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "ServiceIncident" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compensation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amountKop" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Compensation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "ServiceIncident" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Compensation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "organizationId" TEXT,
    "openedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "slaRespondAt" DATETIME NOT NULL,
    "slaResolveAt" DATETIME NOT NULL,
    "firstResponseAt" DATETIME,
    "resolvedAt" DATETIME,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "inn" TEXT,
    "legalName" TEXT,
    "address" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "serviceType" TEXT NOT NULL,
    "speedMbps" INTEGER,
    "desiredDate" DATETIME,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "surveyAvailability" TEXT,
    "surveyNotes" TEXT,
    "quote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConnectionRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "organizationId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TwoFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "recoveryCodes" TEXT NOT NULL,
    "enabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT '[]',
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NpsResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "userId" TEXT,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NpsResponse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NpsResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shortText" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "slaUptime" REAL NOT NULL DEFAULT 99.5,
    "slaResponseHours" INTEGER NOT NULL DEFAULT 4,
    "slaResolveHours" INTEGER NOT NULL DEFAULT 24,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Service" ("category", "description", "features", "iconKey", "id", "order", "shortText", "slug", "title") SELECT "category", "description", "features", "iconKey", "id", "order", "shortText", "slug", "title" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE TABLE "new_UserService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "siteId" TEXT,
    "tariffSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserService_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserService" ("id", "serviceId", "startedAt", "status", "tariffSlug", "userId") SELECT "id", "serviceId", "startedAt", "status", "tariffSlug", "userId" FROM "UserService";
DROP TABLE "UserService";
ALTER TABLE "new_UserService" RENAME TO "UserService";
CREATE INDEX "UserService_userId_idx" ON "UserService"("userId");
CREATE INDEX "UserService_serviceId_idx" ON "UserService"("serviceId");
CREATE INDEX "UserService_siteId_idx" ON "UserService"("siteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_inn_key" ON "Organization"("inn");

-- CreateIndex
CREATE INDEX "Organization_accountManagerId_idx" ON "Organization"("accountManagerId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "Site_organizationId_idx" ON "Site"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_number_key" ON "Account"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Account_organizationId_key" ON "Account"("organizationId");

-- CreateIndex
CREATE INDEX "Charge_accountId_period_idx" ON "Charge"("accountId", "period");

-- CreateIndex
CREATE INDEX "Charge_invoiceId_idx" ON "Charge"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_accountId_idx" ON "Payment"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "Invoice_accountId_idx" ON "Invoice"("accountId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StatusComponent_slug_key" ON "StatusComponent"("slug");

-- CreateIndex
CREATE INDEX "ServiceIncident_severity_idx" ON "ServiceIncident"("severity");

-- CreateIndex
CREATE INDEX "ServiceIncident_resolvedAt_idx" ON "ServiceIncident"("resolvedAt");

-- CreateIndex
CREATE INDEX "IncidentUpdate_incidentId_idx" ON "IncidentUpdate"("incidentId");

-- CreateIndex
CREATE INDEX "Compensation_organizationId_idx" ON "Compensation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Compensation_incidentId_organizationId_key" ON "Compensation"("incidentId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_number_key" ON "Ticket"("number");

-- CreateIndex
CREATE INDEX "Ticket_organizationId_status_idx" ON "Ticket"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_status_idx" ON "ConnectionRequest"("status");

-- CreateIndex
CREATE INDEX "ConnectionRequest_organizationId_idx" ON "ConnectionRequest"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactor_userId_key" ON "TwoFactor"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "ApiKey_prefix_idx" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "NpsResponse_organizationId_idx" ON "NpsResponse"("organizationId");

-- CreateIndex
CREATE INDEX "NpsResponse_createdAt_idx" ON "NpsResponse"("createdAt");
