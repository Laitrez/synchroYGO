-- CreateTable
CREATE TABLE `_CardPriceRelation` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CardPriceRelation_AB_unique`(`A`, `B`),
    INDEX `_CardPriceRelation_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CardPriceRelation` ADD CONSTRAINT `_CardPriceRelation_A_fkey` FOREIGN KEY (`A`) REFERENCES `card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CardPriceRelation` ADD CONSTRAINT `_CardPriceRelation_B_fkey` FOREIGN KEY (`B`) REFERENCES `card_price`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
