-- CreateTable
CREATE TABLE `Lecturer` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `secondName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `type` ENUM('internal', 'external') NOT NULL,
    `courseLevelPreference` ENUM('bachelor', 'master', 'both') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lecturer_email_key`(`email`),
    UNIQUE INDEX `Lecturer_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
