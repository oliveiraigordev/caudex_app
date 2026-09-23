-- CreateTable
CREATE TABLE "AlertDismissal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertKey" TEXT NOT NULL,
    "dismissedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertDismissal_alertKey_key" ON "AlertDismissal"("alertKey");
