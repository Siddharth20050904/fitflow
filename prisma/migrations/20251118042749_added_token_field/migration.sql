/*
  Warnings:

  - Added the required column `tokenId` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "tokenId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "tokenId" TEXT NOT NULL;
