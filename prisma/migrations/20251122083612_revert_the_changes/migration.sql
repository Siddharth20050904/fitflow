/*
  Warnings:

  - You are about to drop the column `packageId` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_packageId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "packageId";
