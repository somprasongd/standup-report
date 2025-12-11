-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed a system user so the default project can satisfy the FK
INSERT INTO public."User" ("id","email","name")
VALUES ('system','system@localhost','System')
ON CONFLICT ("id") DO NOTHING;

-- Add default project type, tied to the system user
INSERT INTO public."Project" ("name","code","description","createdById")
VALUES ('Unknown','UNK','Project not specified. Use this temporarily and reassign when known.','system')
ON CONFLICT ("code") DO NOTHING;

-- Ensure updatedAt is populated for any seeded rows
UPDATE public."Project" SET "updatedAt" = COALESCE("updatedAt", NOW()) WHERE "updatedAt" IS NULL;
