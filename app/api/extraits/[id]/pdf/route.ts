import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

// ─────────────────────────────────────────
// GET /api/extraits/[id]/pdf
// Génère et retourne le PDF en streaming
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
        user: { select: { nom: true, prenom: true } },
      },
    });

    if (!extrait) {
      return Response.json({ error: "Extrait introuvable" }, { status: 404 });
    }

    if (role === "CITOYEN" && extrait.userId !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (!extrait.declaration.acte) {
      return Response.json({ error: "Aucun acte associé" }, { status: 400 });
    }

    const { generatePDF } = await import("@/lib/pdf");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await generatePDF(extrait as any);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EXTRAIT_TELECHARGE",
        details: { extraitId: id },
      },
    });

    const nomFichier =
      `extrait-${extrait.declaration.nomEnfant}-${extrait.declaration.acte.numero}.pdf`
        .toLowerCase()
        .replace(/\s+/g, "-");

    // Conversion Buffer → Uint8Array pour compatibilité avec la Web API Response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomFichier}"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
