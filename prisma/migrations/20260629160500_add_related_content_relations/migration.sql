-- CreateTable
CREATE TABLE `_RelatedServices` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_RelatedServices_AB_unique`(`A`, `B`),
    INDEX `_RelatedServices_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RelatedNews` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_RelatedNews_AB_unique`(`A`, `B`),
    INDEX `_RelatedNews_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_RelatedServices` ADD CONSTRAINT `_RelatedServices_A_fkey` FOREIGN KEY (`A`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RelatedServices` ADD CONSTRAINT `_RelatedServices_B_fkey` FOREIGN KEY (`B`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RelatedNews` ADD CONSTRAINT `_RelatedNews_A_fkey` FOREIGN KEY (`A`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RelatedNews` ADD CONSTRAINT `_RelatedNews_B_fkey` FOREIGN KEY (`B`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
