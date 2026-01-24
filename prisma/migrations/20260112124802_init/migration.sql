-- CreateEnum
CREATE TYPE "LecturerType" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "CourseLevelPreference" AS ENUM ('bachelor', 'master', 'both');

-- CreateTable
CREATE TABLE "Lecturer" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "LecturerType" NOT NULL,
    "courseLevelPreference" "CourseLevelPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_email_key" ON "Lecturer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_phone_key" ON "Lecturer"("phone");
