/*
  Warnings:

  - You are about to drop the column `betaId` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `konamiId` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `mdRarity` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `ygoprodecUrl` on the `card` table. All the data in the column will be lost.
  - You are about to alter the column `cardmarket_price` on the `card_price` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `tcgplayer_price` on the `card_price` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `ebay_price` on the `card_price` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `amazon_price` on the `card_price` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `coolstuffinc_price` on the `card_price` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `beta_id` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `konami_id` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `md_rarity` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ygoprodeck_url` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `card` DROP COLUMN `betaId`,
    DROP COLUMN `konamiId`,
    DROP COLUMN `mdRarity`,
    DROP COLUMN `ygoprodecUrl`,
    ADD COLUMN `beta_id` INTEGER NOT NULL,
    ADD COLUMN `konami_id` INTEGER NOT NULL,
    ADD COLUMN `md_rarity` VARCHAR(191) NOT NULL,
    ADD COLUMN `ygoprodeck_url` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `card_price` MODIFY `cardmarket_price` INTEGER NOT NULL,
    MODIFY `tcgplayer_price` INTEGER NOT NULL,
    MODIFY `ebay_price` INTEGER NOT NULL,
    MODIFY `amazon_price` INTEGER NOT NULL,
    MODIFY `coolstuffinc_price` INTEGER NOT NULL;
