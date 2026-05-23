import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";
import { ChangeRoleSchema } from "@/lib/validations";
import { clerkClient } from "@clerk/nextjs/server";

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/[id]/role
// Admin seulement
// Met à jour le rôle dans la DB ET dans les publicMetadata Clerk
// Les deux doivent toujours être synchronisés
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const { user: adminUser } = await requireRole("ADMIN");

    if (adminUser.id === id) {
      return Response.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const parsed = ChangeRoleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Rôle invalide", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return Response.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    const { role } = parsed.data;

    // 1. Mettre à jour en DB
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, nom: true, prenom: true, email: true, role: true },
    });

    // 2. Mettre à jour les publicMetadata Clerk
    // ← CRUCIAL : le proxy.ts lit depuis sessionClaims qui vient des publicMetadata
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(targetUser.clerkId, {
        publicMetadata: { role },
      });
    } catch (err) {
      console.error("[role] Erreur mise à jour Clerk metadata:", err);
      // On ne fait pas échouer la requête — la DB est à jour
      // L'utilisateur devra se déconnecter/reconnecter pour que le proxy prenne effet
    }

    return Response.json({
      user: updated,
      message: `Rôle mis à jour. L'utilisateur doit se déconnecter et reconnecter pour que le changement prenne effet.`,
    });
  });
}
