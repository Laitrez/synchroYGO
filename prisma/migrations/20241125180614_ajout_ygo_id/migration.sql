/*
  Warnings:

  - Added the required column `ygo_id` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `card` ADD COLUMN `ygo_id` INTEGER NOT NULL;
