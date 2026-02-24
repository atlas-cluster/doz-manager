/*
  Warnings:

  - Added the required column `experience` to the `CourseQualification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadTime` to the `CourseQualification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CourseQualification` ADD COLUMN `experience` ENUM('provadis', 'other_uni', 'none') NOT NULL,
    ADD COLUMN `leadTime` ENUM('short', 'four_weeks', 'more_weeks') NOT NULL;
