import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { withErrorHandler } from "@/lib/utils";
import { PaginationSchema } from "@/lib/validations";

// ─────────────────────────────────────────
// GET /api/users
// Admin seulement
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
    });

    if (!parsed.success) {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const { page, limit, search } = parsed.data;
    const role = searchParams.get("role") as string | null;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role && ["CITOYEN", "OFFICIER", "ADMIN"].includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return Response.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  });
}
