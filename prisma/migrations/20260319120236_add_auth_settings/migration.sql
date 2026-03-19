-- CreateTable
CREATE TABLE `auth_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `passwordEnabled` BOOLEAN NOT NULL DEFAULT true,
    `passkeyEnabled` BOOLEAN NOT NULL DEFAULT true,
    `microsoftEnabled` BOOLEAN NOT NULL DEFAULT false,
    `microsoftClientId` TEXT NULL,
    `microsoftClientSecret` TEXT NULL,
    `microsoftTenantId` TEXT NULL,
    `githubEnabled` BOOLEAN NOT NULL DEFAULT false,
    `githubClientId` TEXT NULL,
    `githubClientSecret` TEXT NULL,
    `oauthEnabled` BOOLEAN NOT NULL DEFAULT false,
    `oauthClientId` TEXT NULL,
    `oauthClientSecret` TEXT NULL,
    `oauthIssuerUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

