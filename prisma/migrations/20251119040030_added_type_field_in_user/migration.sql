/*
  Warnings:

  - Added the required column `type` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "type" "Type" NOT NULL;
