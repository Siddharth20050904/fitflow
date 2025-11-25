/*
  Warnings:

  - You are about to drop the column `orderId` on the `StoreOrder` table. All the data in the column will be lost.
  - Added the required column `memberName` to the `StoreOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StoreOrder_orderId_key";

-- AlterTable
ALTER TABLE "StoreOrder" DROP COLUMN "orderId",
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "memberName" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "StoreProduct" ADD COLUMN     "sales" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "StoreOrder_memberId_idx" ON "StoreOrder"("memberId");
