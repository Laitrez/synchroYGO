-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `card_cardArchetypeId_fkey`;

-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `card_cardRaceId_fkey`;

-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `card_cardTypeId_fkey`;

-- AlterTable
ALTER TABLE `card` MODIFY `cardTypeId` INTEGER NULL,
    MODIFY `cardRaceId` INTEGER NULL,
    MODIFY `cardArchetypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardTypeId_fkey` FOREIGN KEY (`cardTypeId`) REFERENCES `card_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardRaceId_fkey` FOREIGN KEY (`cardRaceId`) REFERENCES `card_race`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardArchetypeId_fkey` FOREIGN KEY (`cardArchetypeId`) REFERENCES `card_archetype`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
