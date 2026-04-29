-- Merge CourseQualification into CourseAssignment.
-- Existing CourseAssignment rows represent actual assignments → mark them as isAssigned = TRUE.
-- Rows that only exist in CourseQualification are inserted as isAssigned = FALSE with leadTime/experience copied over.

-- AlterTable: add merged fields to CourseAssignment.
ALTER TABLE `CourseAssignment`
    ADD COLUMN `isAssigned` BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN `leadTime` ENUM('short', 'four_weeks', 'more_weeks') NULL,
    ADD COLUMN `experience` ENUM('provadis', 'other_uni', 'none') NULL,
    ADD COLUMN `courseLevelPreference` ENUM('bachelor', 'master', 'both') NULL;

-- Backfill: every pre-existing CourseAssignment row was an actual assignment.
UPDATE `CourseAssignment` SET `isAssigned` = TRUE;

-- Backfill: copy qualification data into existing CourseAssignment rows.
UPDATE `CourseAssignment` ca
JOIN `CourseQualification` cq
    ON ca.`lecturerId` = cq.`lecturerId`
   AND ca.`courseId`   = cq.`courseId`
SET ca.`leadTime`   = cq.`leadTime`,
    ca.`experience` = cq.`experience`;

-- Backfill: insert qualification-only rows as non-assigned CourseAssignments.
INSERT INTO `CourseAssignment` (`lecturerId`, `courseId`, `isAssigned`, `leadTime`, `experience`, `createdAt`, `updatedAt`)
SELECT cq.`lecturerId`, cq.`courseId`, FALSE, cq.`leadTime`, cq.`experience`, cq.`createdAt`, cq.`updatedAt`
FROM `CourseQualification` cq
LEFT JOIN `CourseAssignment` ca
    ON ca.`lecturerId` = cq.`lecturerId`
   AND ca.`courseId`   = cq.`courseId`
WHERE ca.`lecturerId` IS NULL;

-- DropTable
DROP TABLE `CourseQualification`;

