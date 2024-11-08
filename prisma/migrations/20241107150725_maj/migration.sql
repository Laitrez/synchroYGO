-- AlterTable
ALTER TABLE `card_price` MODIFY `cardmarket_price` VARCHAR(191) NOT NULL,
    MODIFY `tcgplayer_price` VARCHAR(191) NOT NULL,
    MODIFY `ebay_price` VARCHAR(191) NOT NULL,
    MODIFY `amazon_price` VARCHAR(191) NOT NULL,
    MODIFY `coolstuffinc_price` VARCHAR(191) NOT NULL;
