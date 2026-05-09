-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "tariffSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserService" ("id", "serviceId", "startedAt", "status", "tariffSlug", "userId") SELECT "id", "serviceId", "startedAt", "status", "tariffSlug", "userId" FROM "UserService";
DROP TABLE "UserService";
ALTER TABLE "new_UserService" RENAME TO "UserService";
CREATE INDEX "UserService_userId_idx" ON "UserService"("userId");
CREATE INDEX "UserService_serviceId_idx" ON "UserService"("serviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
