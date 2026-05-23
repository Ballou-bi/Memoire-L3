-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITOYEN', 'OFFICIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutDeclaration" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "TypeExtrait" AS ENUM ('INTEGRALE', 'AVEC_FILIATION', 'SANS_FILIATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITOYEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "citoyenId" TEXT NOT NULL,
    "officierId" TEXT,
    "prenomEnfant" TEXT NOT NULL,
    "nomEnfant" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "lieuNaissance" TEXT NOT NULL,
    "sexe" TEXT NOT NULL,
    "nomPere" TEXT NOT NULL,
    "prenomPere" TEXT NOT NULL,
    "nomMere" TEXT NOT NULL,
    "prenomMere" TEXT NOT NULL,
    "statut" "StatutDeclaration" NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRejet" TEXT,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acte" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dateValidation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declarationId" TEXT NOT NULL,

    CONSTRAINT "Acte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extrait" (
    "id" TEXT NOT NULL,
    "type" "TypeExtrait" NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,

    CONSTRAINT "Extrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Declaration_citoyenId_idx" ON "Declaration"("citoyenId");

-- CreateIndex
CREATE INDEX "Declaration_officierId_idx" ON "Declaration"("officierId");

-- CreateIndex
CREATE INDEX "Declaration_statut_idx" ON "Declaration"("statut");

-- CreateIndex
CREATE INDEX "Declaration_nomEnfant_idx" ON "Declaration"("nomEnfant");

-- CreateIndex
CREATE INDEX "Declaration_prenomEnfant_idx" ON "Declaration"("prenomEnfant");

-- CreateIndex
CREATE INDEX "Declaration_createdAt_idx" ON "Declaration"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Acte_numero_key" ON "Acte"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Acte_declarationId_key" ON "Acte"("declarationId");

-- CreateIndex
CREATE INDEX "Acte_numero_idx" ON "Acte"("numero");

-- CreateIndex
CREATE INDEX "Extrait_userId_idx" ON "Extrait"("userId");

-- CreateIndex
CREATE INDEX "Extrait_declarationId_idx" ON "Extrait"("declarationId");

-- CreateIndex
CREATE INDEX "Extrait_createdAt_idx" ON "Extrait"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_citoyenId_fkey" FOREIGN KEY ("citoyenId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_officierId_fkey" FOREIGN KEY ("officierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acte" ADD CONSTRAINT "Acte_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extrait" ADD CONSTRAINT "Extrait_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extrait" ADD CONSTRAINT "Extrait_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
