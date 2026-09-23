-- CreateTable
CREATE TABLE "CultivationLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "exposedToRain" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nickname" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'SEMENTE',
    "phase" TEXT NOT NULL DEFAULT 'MUDA_SEMENTE',
    "status" TEXT NOT NULL DEFAULT 'SAUDAVEL',
    "heightCm" REAL,
    "arrivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "substrateNotes" TEXT,
    "sunExposurePercent" INTEGER NOT NULL DEFAULT 80,
    "locationId" TEXT,
    "parentMaleId" TEXT,
    "parentFemaleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plant_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CultivationLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plant_parentMaleId_fkey" FOREIGN KEY ("parentMaleId") REFERENCES "Plant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plant_parentFemaleId_fkey" FOREIGN KEY ("parentFemaleId") REFERENCES "Plant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlantEvent_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT NOT NULL,
    "eventId" TEXT,
    "path" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlantPhoto_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlantPhoto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlantEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "locationLat" REAL NOT NULL DEFAULT -22.68,
    "locationLon" REAL NOT NULL DEFAULT -44.32,
    "cityName" TEXT NOT NULL DEFAULT 'Bananal, SP',
    "waterDaysSeedling" INTEGER NOT NULL DEFAULT 4,
    "waterDaysAdult" INTEGER NOT NULL DEFAULT 10,
    "fertDaysSeedling" INTEGER NOT NULL DEFAULT 14,
    "fertDaysAdult" INTEGER NOT NULL DEFAULT 30,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "Plant_code_key" ON "Plant"("code");
