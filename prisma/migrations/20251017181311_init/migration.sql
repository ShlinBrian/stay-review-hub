-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "rating" REAL,
    "publicReview" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "displayOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "categories" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Review_propertyId_idx" ON "Review"("propertyId");

-- CreateIndex
CREATE INDEX "Review_displayOnWebsite_idx" ON "Review"("displayOnWebsite");
