-- AlterTable
ALTER TABLE "Guild" ALTER COLUMN "icon" DROP NOT NULL,
ALTER COLUMN "icon" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "icon" DROP NOT NULL,
ALTER COLUMN "icon" DROP DEFAULT;
