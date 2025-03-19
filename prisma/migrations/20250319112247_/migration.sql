/*
  Warnings:

  - You are about to drop the column `studentId` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookId]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Rental` DROP FOREIGN KEY `Rental_studentId_fkey`;

-- DropIndex
DROP INDEX `Rental_studentId_fkey` ON `Rental`;

-- AlterTable
ALTER TABLE `Book` ADD COLUMN `coverImage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Rental` DROP COLUMN `studentId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Student`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Rental_userId_key` ON `Rental`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Rental_bookId_key` ON `Rental`(`bookId`);

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
