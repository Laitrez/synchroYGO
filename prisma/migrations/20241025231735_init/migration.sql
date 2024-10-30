-- CreateTable
CREATE TABLE `card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `name_en` VARCHAR(191) NOT NULL,
    `ygoprodecUrl` VARCHAR(191) NOT NULL,
    `betaId` INTEGER NOT NULL,
    `konamiId` INTEGER NOT NULL,
    `mdRarity` VARCHAR(191) NOT NULL,
    `cardTypeId` INTEGER NOT NULL,
    `cardRaceId` INTEGER NOT NULL,
    `cardArchetypeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `set_name` VARCHAR(191) NOT NULL,
    `set_code` INTEGER NOT NULL,
    `set_rarity` VARCHAR(191) NOT NULL,
    `set_rarity_code` INTEGER NOT NULL,
    `set_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardmarket_price` INTEGER NOT NULL,
    `tcgplayer_price` INTEGER NOT NULL,
    `ebay_price` INTEGER NOT NULL,
    `amazon_price` INTEGER NOT NULL,
    `coolstuffinc_price` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `human_readable_type` VARCHAR(191) NOT NULL,
    `frame_type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_race` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_archetype` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_formats` (
    `cardId` INTEGER NOT NULL,
    `formatsId` INTEGER NOT NULL,

    UNIQUE INDEX `card_formats_cardId_formatsId_key`(`cardId`, `formatsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `decks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `creation_date` DATE NOT NULL,
    `is_public` BOOLEAN NOT NULL,

    UNIQUE INDEX `decks_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deck_cards` (
    `occurs` INTEGER NOT NULL,
    `cardId` INTEGER NOT NULL,
    `deckId` INTEGER NOT NULL,

    PRIMARY KEY (`cardId`, `deckId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctrine_migration_versions` (
    `version` VARCHAR(191) NOT NULL,
    `executed_at` DATETIME(0) NULL,
    `execution_time` INTEGER NULL,

    PRIMARY KEY (`version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `deck_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `favorites` BOOLEAN NOT NULL,
    `occurs` INTEGER NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `cardId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `create_at` DATE NOT NULL,
    `delete_at` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardTypeId_fkey` FOREIGN KEY (`cardTypeId`) REFERENCES `card_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardRaceId_fkey` FOREIGN KEY (`cardRaceId`) REFERENCES `card_race`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_cardArchetypeId_fkey` FOREIGN KEY (`cardArchetypeId`) REFERENCES `card_archetype`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_formats` ADD CONSTRAINT `card_formats_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_formats` ADD CONSTRAINT `card_formats_formatsId_fkey` FOREIGN KEY (`formatsId`) REFERENCES `formats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deck_cards` ADD CONSTRAINT `deck_cards_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deck_cards` ADD CONSTRAINT `deck_cards_deckId_fkey` FOREIGN KEY (`deckId`) REFERENCES `decks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_deck_id_fkey` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_cards` ADD CONSTRAINT `user_cards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_cards` ADD CONSTRAINT `user_cards_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
