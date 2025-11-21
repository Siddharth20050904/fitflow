/*
  Warnings:

  - You are about to drop the column `billId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_packageId_fkey";

-- DropForeignKey
ALTER TABLE "Package" DROP CONSTRAINT "Package_adminId_fkey";

-- DropIndex
DROP INDEX "Bill_billId_key";

-- DropIndex
DROP INDEX "Bill_packageId_idx";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "billId",
DROP COLUMN "packageId";

-- DropTable
DROP TABLE "Package";
