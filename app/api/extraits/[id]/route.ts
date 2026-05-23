import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

// ─────────────────────────────────────────
// GET /api/extraits/[id]
// ─────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const { user, role } = await requireAuth();

    const extrait = await prisma.extrait.findUnique({
      where: { id },
      include: {
        declaration: {
          include: {
            acte: true,
            citoyen: { select: { nom: true, prenom: true } },
          },
        },
        user: { select: { nom: true, prenom: true, email: true } },
      },
    });

    if (!extrait) {
      return Response.json({ error: "Extrait introuvable" }, { status: 404 });
    }

    // Citoyen : seulement ses propres extraits
    if (role === "CITOYEN" && extrait.userId !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    return Response.json({ extrait });
  });
}
