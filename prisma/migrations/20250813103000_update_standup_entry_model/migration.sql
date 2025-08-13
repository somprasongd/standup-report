-- AlterTable
ALTER TABLE "StandupEntry" DROP COLUMN "name",
ALTER COLUMN "userId" SET NOT NULL;