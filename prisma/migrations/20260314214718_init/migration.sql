-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PageViewAggregate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "bucketTime" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PrivacyBudget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric" TEXT NOT NULL,
    "epsilonUsed" REAL NOT NULL,
    "timestamp" INTEGER NOT NULL
);
