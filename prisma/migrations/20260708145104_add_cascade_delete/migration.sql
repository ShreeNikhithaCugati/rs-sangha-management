-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_sanghaId_fkey";

-- DropForeignKey
ALTER TABLE "SanghaRequest" DROP CONSTRAINT "SanghaRequest_adminId_fkey";

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_sanghaId_fkey" FOREIGN KEY ("sanghaId") REFERENCES "Sangha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanghaRequest" ADD CONSTRAINT "SanghaRequest_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
