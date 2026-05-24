import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

// ─────────────────────────────────────────
// GET /api/stats
// Officier et Admin seulement
// ─────────────────────────────────────────
export async function GET() {
  return withErrorHandler(async () => {
    await requireRole("OFFICIER", "ADMIN");

    const [
      totalDeclarations,
      declarationsEnAttente,
      declarationsValidees,
      declarationsRejetees,
      totalExtraits,
      totalUsers,
      totalOfficiers,
      declarationsParMois,
    ] = await Promise.all([
      prisma.declaration.count(),
      prisma.declaration.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.declaration.count({ where: { statut: "VALIDEE" } }),
      prisma.declaration.count({ where: { statut: "REJETEE" } }),
      prisma.extrait.count(),
      prisma.user.count({ where: { role: "CITOYEN" } }),
      prisma.user.count({ where: { role: "OFFICIER" } }),

      // Déclarations des 6 derniers mois groupées par mois
      prisma.$queryRaw<{ mois: string; total: bigint }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS mois,
          COUNT(*) AS total
        FROM "Declaration"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `,
    ]);

    return Response.json({
      declarations: {
        total: totalDeclarations,
        enAttente: declarationsEnAttente,
        validees: declarationsValidees,
        rejetees: declarationsRejetees,
        tauxValidation:
          totalDeclarations > 0
            ? Math.round((declarationsValidees / totalDeclarations) * 100)
            : 0,
      },
      extraits: {
        total: totalExtraits,
      },
      utilisateurs: {
        citoyens: totalUsers,
        officiers: totalOfficiers,
      },
      historique: declarationsParMois.map((row) => ({
        mois: row.mois,
        total: Number(row.total),
      })),
    });
  });
}
