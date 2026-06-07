import { prisma } from "@/lib/prisma";
import { requireRole, generateNumeroActe } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";
import { ValidateDeclarationSchema } from "@/lib/validations";

// ─────────────────────────────────────────
// POST /api/declarations/[id]/validate
// Officier et Admin seulement
// ─────────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const { user } = await requireRole("OFFICIER", "ADMIN");

    const body = await req.json();
    const parsed = ValidateDeclarationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const declaration = await prisma.declaration.findUnique({
      where: { id },
      include: { acte: true }, // ← inclure l'acte existant éventuel
    });

    if (!declaration) {
      return Response.json(
        { error: "Déclaration introuvable" },
        { status: 404 },
      );
    }

    if (declaration.statut !== "EN_ATTENTE") {
      return Response.json(
        { error: "Cette déclaration a déjà été traitée" },
        { status: 400 },
      );
    }

    const { action, motifRejet } = parsed.data;
    const nouveauStatut = action === "VALIDER" ? "VALIDEE" : "REJETEE";

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.declaration.update({
        where: { id },
        data: {
          statut: nouveauStatut,
          officierId: user.id,
          motifRejet: action === "REJETER" ? motifRejet : null,
        },
        include: {
          citoyen: { select: { nom: true, prenom: true, email: true } },
          officier: { select: { nom: true, prenom: true } },
        },
      });

      let acte = null;
      if (action === "VALIDER") {
        // ✅ Si un acte existe déjà (cas Prisma Studio), on le réutilise
        if (declaration.acte) {
          acte = declaration.acte;
        } else {
          acte = await tx.acte.create({
            data: {
              numero: generateNumeroActe(),
              declarationId: id,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action:
            action === "VALIDER"
              ? "DECLARATION_VALIDEE"
              : "DECLARATION_REJETEE",
          details: { declarationId: id, motifRejet: motifRejet ?? null },
        },
      });

      return { declaration: updated, acte };
    });

    // ── Notification email selon l'action ──
    try {
      const citoyen = result.declaration.citoyen;

      if (action === "VALIDER") {
        const { sendDeclarationValidee } = await import("@/lib/emails");
        await sendDeclarationValidee({
          email: citoyen.email,
          prenom: citoyen.prenom,
          prenomEnfant: result.declaration.prenomEnfant,
          nomEnfant: result.declaration.nomEnfant,
          numeroActe: result.acte!.numero,
          declarationId: id,
        });
      } else {
        const { sendDeclarationRejetee } = await import("@/lib/emails");
        await sendDeclarationRejetee({
          email: citoyen.email,
          prenom: citoyen.prenom,
          prenomEnfant: result.declaration.prenomEnfant,
          nomEnfant: result.declaration.nomEnfant,
          motifRejet: motifRejet ?? null,
          declarationId: id,
        });
      }
    } catch (err) {
      console.error("[Email] Erreur envoi notification:", err);
    }

    return Response.json(result);
  });
}
