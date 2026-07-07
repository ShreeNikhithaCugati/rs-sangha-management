/*
  Warnings:

  - You are about to drop the column `reviewedAt` on the `SanghaRequest` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `SanghaRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SanghaRequest" DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedBy";
