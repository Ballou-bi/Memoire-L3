import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";

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
          select: {
            // Enfant
            nomEnfant: true,
            prenomEnfant: true,
            dateNaissance: true,
            lieuNaissance: true,
            sexe: true,
            // Père — nouveaux champs
            nomPere: true,
            prenomPere: true,
            professionPere: true,
            nationalitePere: true,
            residencePere: true,
            // Mère — nouveaux champs
            nomMere: true,
            prenomMere: true,
            professionMere: true,
            nationaliteMere: true,
            residenceMere: true,
            // Relations
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
    const pdfBuffer = await generatePDF(
      extrait as Parameters<typeof generatePDF>[0],
    );

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

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomFichier}"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
