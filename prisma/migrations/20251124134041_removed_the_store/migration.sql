/*
  Warnings:

  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_adminId_fkey";

-- DropForeignKey
ALTER TABLE "StoreOrder" DROP CONSTRAINT "StoreOrder_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreProduct" DROP CONSTRAINT "StoreProduct_storeId_fkey";

-- DropTable
DROP TABLE "Store";
