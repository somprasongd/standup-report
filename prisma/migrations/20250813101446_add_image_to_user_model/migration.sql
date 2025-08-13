-- DropForeignKey
ALTER TABLE "public"."StandupEntry" DROP CONSTRAINT "StandupEntry_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."StandupEntry" ADD CONSTRAINT "StandupEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
