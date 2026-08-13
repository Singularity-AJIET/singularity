-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team_name" TEXT NOT NULL,
    "team_number" TEXT,
    "college" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "team_id" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "is_reported" BOOLEAN NOT NULL DEFAULT false,
    "reported_at" DATETIME,
    CONSTRAINT "participants_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "is_reported" BOOLEAN NOT NULL DEFAULT false,
    "reported_at" DATETIME
);

-- CreateTable
CREATE TABLE "counter_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "opened_at" DATETIME,
    "closed_at" DATETIME
);

-- CreateTable
CREATE TABLE "claims" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" TEXT,
    "staff_id" TEXT,
    "item_type" TEXT NOT NULL,
    "claimed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_id" TEXT,
    CONSTRAINT "claims_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "claims_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "event_staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "claims_item_type_fkey" FOREIGN KEY ("item_type") REFERENCES "counter_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_staff_email_key" ON "event_staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "claims_participant_id_item_type_key" ON "claims"("participant_id", "item_type");

-- CreateIndex
CREATE UNIQUE INDEX "claims_staff_id_item_type_key" ON "claims"("staff_id", "item_type");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
