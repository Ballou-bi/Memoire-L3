import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";
import { DeclarationSchema, PaginationSchema } from "@/lib/validations";

// ─────────────────────────────────────────
// GET /api/declarations
// Citoyen : ses propres déclarations
// Officier : toutes les déclarations EN_ATTENTE
// Admin : toutes les déclarations
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { user, role } = await requireAuth();

    const { searchParams } = new URL(req.url);
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      statut: searchParams.get("statut"),
      search: searchParams.get("search"),
    });

    if (!parsed.success) {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const { page, limit, statut, search } = parsed.data;
    const skip = (page - 1) * limit;

    // Filtre selon le rôle
    const where: Record<string, unknown> = {};

    if (role === "CITOYEN") {
      where.citoyenId = user.id;
    }
    if (role === "OFFICIER") {
      // L'officier voit tout ce qui est en attente + ce qu'il a traité
      where.OR = [{ statut: "EN_ATTENTE" }, { officierId: user.id }];
    }
    if (statut) {
      where.statut = statut;
    }
    if (search) {
      where.OR = [
        { nomEnfant: { contains: search, mode: "insensitive" } },
        { prenomEnfant: { contains: search, mode: "insensitive" } },
        { lieuNaissance: { contains: search, mode: "insensitive" } },
      ];
    }

    const [declarations, total] = await Promise.all([
      prisma.declaration.findMany({
        where,
        include: {
          citoyen: { select: { nom: true, prenom: true, email: true } },
          officier: { select: { nom: true, prenom: true } },
          acte: true,
          _count: { select: { extraits: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.declaration.count({ where }),
    ]);

    return Response.json({
      declarations,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  });
}

// ─────────────────────────────────────────
// POST /api/declarations
// Citoyen seulement
// ─────────────────────────────────────────
export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const { user } = await requireRole("CITOYEN");

    const body = await req.json();
    const parsed = DeclarationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const declaration = await prisma.declaration.create({
      data: {
        ...parsed.data,
        dateNaissance: new Date(parsed.data.dateNaissance),
        citoyenId: user.id,
        statut: "EN_ATTENTE",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DECLARATION_CREEE",
        details: { declarationId: declaration.id },
      },
    });

    return Response.json({ declaration }, { status: 201 });
  });
}
