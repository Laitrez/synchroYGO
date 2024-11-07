/*
  Warnings:

  - You are about to drop the column `cardId` on the `card_sets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `card_sets` DROP FOREIGN KEY `card_sets_cardId_fkey`;

-- AlterTable
ALTER TABLE `card_sets` DROP COLUMN `cardId`;

-- CreateTable
CREATE TABLE `_CardSetsRelation` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CardSetsRelation_AB_unique`(`A`, `B`),
    INDEX `_CardSetsRelation_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CardSetsRelation` ADD CONSTRAINT `_CardSetsRelation_A_fkey` FOREIGN KEY (`A`) REFERENCES `card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CardSetsRelation` ADD CONSTRAINT `_CardSetsRelation_B_fkey` FOREIGN KEY (`B`) REFERENCES `card_sets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
