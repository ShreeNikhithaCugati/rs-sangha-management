-- CreateEnum
CREATE TYPE "ReactivationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "SanghaReactivationRequest" (
    "id" TEXT NOT NULL,
    "sanghaId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminPhone" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "status" "ReactivationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "SanghaReactivationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SanghaReactivationRequest" ADD CONSTRAINT "SanghaReactivationRequest_sanghaId_fkey" FOREIGN KEY ("sanghaId") REFERENCES "Sangha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
