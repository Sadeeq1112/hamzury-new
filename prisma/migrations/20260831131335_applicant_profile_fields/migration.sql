-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "education" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "heardAbout" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "orgType" TEXT;
