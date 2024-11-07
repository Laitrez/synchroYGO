-- AlterTable
ALTER TABLE `card_sets` ADD COLUMN `cardId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `card_sets` ADD CONSTRAINT `card_sets_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
