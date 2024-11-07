/*
  Warnings:

  - You are about to drop the `card_formats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `card_formats` DROP FOREIGN KEY `card_formats_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `card_formats` DROP FOREIGN KEY `card_formats_formatsId_fkey`;

-- DropTable
DROP TABLE `card_formats`;

-- CreateTable
CREATE TABLE `_CardFormatsRelation` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CardFormatsRelation_AB_unique`(`A`, `B`),
    INDEX `_CardFormatsRelation_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CardFormatsRelation` ADD CONSTRAINT `_CardFormatsRelation_A_fkey` FOREIGN KEY (`A`) REFERENCES `card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CardFormatsRelation` ADD CONSTRAINT `_CardFormatsRelation_B_fkey` FOREIGN KEY (`B`) REFERENCES `formats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
