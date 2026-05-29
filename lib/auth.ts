// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { Role } from "@/types";

// ── Récupère l'user DB depuis le clerkId ─────────────────────────────────────
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// ── Récupère le rôle — SOURCE UNIQUE : la DB ──
// On lit TOUJOURS depuis la DB pour les pages/API
// Le proxy.ts lit depuis sessionClaims pour les redirections réseau
export async function getRole(): Promise<Role> {
  const { userId } = await auth();
  if (!userId) return "CITOYEN";

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return (user?.role as Role) ?? "CITOYEN";
}

// ── requireAuth ──────────────────────────────────────────────────────────────
// Vérifie auth + retourne { user, role } depuis la DB
// Lance une Response 401/404 si problème
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    throw new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { user, role: user.role as Role };
}

// ── requireRole ──────────────────────────────────────────────────────────────
export async function requireRole(...roles: Role[]) {
  const { user, role } = await requireAuth();

  if (!roles.includes(role)) {
    throw new Response(JSON.stringify({ error: "Accès refusé" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { user, role };
}

// ── generateNumeroActe ───────────────────────────────────────────────────────
export function generateNumeroActe(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `ACT-${year}-${timestamp}-${random}`;
}
