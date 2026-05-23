import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

// ─────────────────────────────────────────
// GET /api/declarations/[id]
// ─────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 — Promise
) {
  return withErrorHandler(async () => {
    const { id } = await params; // await obligatoire
    const { user, role } = await requireAuth();

    const declaration = await prisma.declaration.findUnique({
      where: { id },
      include: {
        citoyen: { select: { nom: true, prenom: true, email: true } },
        officier: { select: { nom: true, prenom: true } },
        acte: true,
        extraits: {
          select: { id: true, type: true, createdAt: true, pdfUrl: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!declaration) {
      return Response.json(
        { error: "Déclaration introuvable" },
        { status: 404 },
      );
    }

    // Citoyen : seulement ses propres déclarations
    if (role === "CITOYEN" && declaration.citoyenId !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    return Response.json({ declaration });
  });
}

// ─────────────────────────────────────────
// DELETE /api/declarations/[id]
// Citoyen : seulement si EN_ATTENTE
// Admin : toujours
// ─────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const { user, role } = await requireAuth();

    const declaration = await prisma.declaration.findUnique({ where: { id } });

    if (!declaration) {
      return Response.json(
        { error: "Déclaration introuvable" },
        { status: 404 },
      );
    }

    // Citoyen : seulement la sienne et seulement si EN_ATTENTE
    if (role === "CITOYEN") {
      if (declaration.citoyenId !== user.id) {
        return Response.json({ error: "Accès refusé" }, { status: 403 });
      }
      if (declaration.statut !== "EN_ATTENTE") {
        return Response.json(
          { error: "Impossible de supprimer une déclaration déjà traitée" },
          { status: 400 },
        );
      }
    }

    // Officier ne peut pas supprimer
    if (role === "OFFICIER") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.declaration.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DECLARATION_SUPPRIMEE",
        details: { declarationId: id },
      },
    });

    return Response.json({ success: true });
  });
}
