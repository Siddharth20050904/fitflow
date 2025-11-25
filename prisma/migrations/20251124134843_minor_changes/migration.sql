/*
  Warnings:

  - You are about to drop the column `storeId` on the `StoreOrder` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `StoreProduct` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "StoreOrder_storeId_idx";

-- DropIndex
DROP INDEX "StoreProduct_storeId_idx";

-- AlterTable
ALTER TABLE "StoreOrder" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "StoreProduct" DROP COLUMN "storeId";
