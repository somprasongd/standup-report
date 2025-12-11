import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Ensure legacy columns exist when the DB schema lags behind the Prisma schema.
let standupColumnsEnsured = false;
export async function ensureStandupColumns() {
  if (standupColumnsEnsured) return;
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "StandupEntry" ADD COLUMN IF NOT EXISTS "yesterday" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "StandupEntry" ADD COLUMN IF NOT EXISTS "today" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "StandupEntry" ADD COLUMN IF NOT EXISTS "blockers" TEXT'
    );
    // Legacy columns from older schema versions — relax constraints or add defaults
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- date column: allow nulls and provide a default
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'StandupEntry' AND column_name = 'date'
        ) THEN
          ALTER TABLE "StandupEntry" ALTER COLUMN "date" DROP NOT NULL;
          ALTER TABLE "StandupEntry" ALTER COLUMN "date" SET DEFAULT NOW();
        END IF;
        -- type column: allow nulls
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'StandupEntry' AND column_name = 'type'
        ) THEN
          ALTER TABLE "StandupEntry" ALTER COLUMN "type" DROP NOT NULL;
        END IF;
        -- description column: allow nulls
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'StandupEntry' AND column_name = 'description'
        ) THEN
          ALTER TABLE "StandupEntry" ALTER COLUMN "description" DROP NOT NULL;
        END IF;
      END;
      $$;
    `);
    standupColumnsEnsured = true;
  } catch (error) {
    console.error('Failed to ensure standup columns exist', error);
  }
}

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
