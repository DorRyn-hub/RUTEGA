-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientLogoUrl" TEXT,
    "industry" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'b2b',
    "summary" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "techStack" TEXT NOT NULL DEFAULT '[]',
    "metrics" TEXT NOT NULL DEFAULT '[]',
    "publishedAt" DATETIME NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cover" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoveragePoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "lat" REAL,
    "lng" REAL,
    "geojson" TEXT,
    "metadata" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL,
    "tariffSlug" TEXT,
    "inn" TEXT,
    "companyName" TEXT,
    "consentPdn" BOOLEAN NOT NULL DEFAULT true,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "crmExternalId" TEXT,
    "crmSyncedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'new',
    "note" TEXT,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("assignedToId", "createdAt", "email", "id", "message", "name", "note", "phone", "source", "status", "tariffSlug", "updatedAt") SELECT "assignedToId", "createdAt", "email", "id", "message", "name", "note", "phone", "source", "status", "tariffSlug", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Case_slug_key" ON "Case"("slug");

-- CreateIndex
CREATE INDEX "Case_isPublished_publishedAt_idx" ON "Case"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "CoveragePoint_type_idx" ON "CoveragePoint"("type");
