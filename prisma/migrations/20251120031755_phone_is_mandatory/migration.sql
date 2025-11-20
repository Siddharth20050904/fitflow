/*
  Warnings:

  - Made the column `name` on table `Admin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Admin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "phone" SET NOT NULL;
