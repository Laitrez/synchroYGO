/*
  Warnings:

  - You are about to alter the column `set_price` on the `card_sets` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `card_sets` MODIFY `set_price` VARCHAR(191) NOT NULL;
