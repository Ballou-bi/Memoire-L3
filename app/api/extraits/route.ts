import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";
import { ExtraitRequestSchema, PaginationSchema } from "@/lib/validations";

// ─────────────────────────────────────────
// GET /api/extraits
// Citoyen : ses extraits
// Admin : tous les extraits
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { user, role } = await requireAuth();

    const { searchParams } = new URL(req.url);
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!parsed.success) {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where = role === "CITOYEN" ? { userId: user.id } : {};

    const [extraits, total] = await Promise.all([
      prisma.extrait.findMany({
        where,
        include: {
          declaration: {
            select: {
              nomEnfant: true,
              prenomEnfant: true,
              dateNaissance: true,
              acte: { select: { numero: true } },
            },
          },
          user: { select: { nom: true, prenom: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.extrait.count({ where }),
    ]);

    return Response.json({
      extraits,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  });
}

// ─────────────────────────────────────────
// POST /api/extraits
// Citoyen : pour ses propres déclarations validées
// Admin : pour n'importe quelle déclaration validée
// ─────────────────────────────────────────
export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const { user, role } = await requireAuth();

    // Officier ne peut pas demander d'extraits
    if (role === "OFFICIER") {
      return Response.json(
        { error: "Action non autorisée pour un officier" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = ExtraitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const { declarationId, type } = parsed.data;

    const declaration = await prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { acte: true },
    });

    if (!declaration) {
      return Response.json(
        { error: "Déclaration introuvable" },
        { status: 404 },
      );
    }

    if (declaration.statut !== "VALIDEE") {
      return Response.json(
        {
          error:
            "La déclaration doit être validée avant de demander un extrait",
        },
        { status: 400 },
      );
    }

    // Citoyen : seulement ses propres déclarations
    if (role === "CITOYEN" && declaration.citoyenId !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const extrait = await prisma.extrait.create({
      data: {
        userId: user.id,
        declarationId,
        type,
      },
      include: {
        declaration: {
          select: {
            nomEnfant: true,
            prenomEnfant: true,
            acte: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EXTRAIT_DEMANDE",
        details: { extraitId: extrait.id, type, declarationId },
      },
    });

    return Response.json({ extrait }, { status: 201 });
  });
}
