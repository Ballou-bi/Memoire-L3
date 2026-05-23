import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

// ─────────────────────────────────────────
// GET /api/users/me
// Retourne le profil complet de l'utilisateur connecté
// ─────────────────────────────────────────
export async function GET() {
  return withErrorHandler(async () => {
    const { user } = await requireAuth();

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            declarations: true,
            extraits: true,
          },
        },
      },
    });

    return Response.json({ user: fullUser });
  });
}
