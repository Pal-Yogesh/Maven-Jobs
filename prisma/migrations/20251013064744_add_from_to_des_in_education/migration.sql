-- AlterTable
ALTER TABLE "educations" ADD COLUMN     "current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "from" TEXT,
ADD COLUMN     "to" TEXT;
