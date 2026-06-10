import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import OfficierCard from "./OfficierCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance des officiers — Admin",
};

export default async function AdminOfficiersStatsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const officiers = await prisma.user.findMany({
    where: { role: "OFFICIER" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      createdAt: true,
      _count: { select: { validations: true } },
    },
  });

  const officiersStats = await Promise.all(
    officiers.map(async (o) => {
      const [validees, rejetees, derniereAction] = await Promise.all([
        prisma.declaration.count({
          where: { officierId: o.id, statut: "VALIDEE" },
        }),
        prisma.declaration.count({
          where: { officierId: o.id, statut: "REJETEE" },
        }),
        prisma.declaration.findFirst({
          where: { officierId: o.id },
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        }),
      ]);
      const total = validees + rejetees;
      const taux = total > 0 ? Math.round((validees / total) * 100) : 0;
      return { ...o, validees, rejetees, total, taux, derniereAction };
    }),
  );

  officiersStats.sort((a, b) => b.total - a.total);

  return (
    <>
      <Header
        title="Performance des officiers"
        subtitle={`${officiers.length} officier${officiers.length > 1 ? "s" : ""} actif${officiers.length > 1 ? "s" : ""}`}
      />

      <div className="db-content animate-fade-up">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/admin/stats"
            style={{
              fontSize: "0.78rem",
              color: "var(--ci-orange)",
              textDecoration: "none",
              opacity: 0.8,
            }}
          >
            ← Retour aux statistiques
          </Link>
        </div>

        {officiersStats.length === 0 ? (
          <div
            style={{
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: "4px",
              padding: "3rem",
              textAlign: "center",
              opacity: 0.5,
              fontSize: "0.85rem",
            }}
          >
            Aucun officier enregistré.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {officiersStats.map((o, index) => (
              <OfficierCard
                key={o.id}
                id={o.id}
                index={index}
                prenom={o.prenom}
                nom={o.nom}
                email={o.email}
                total={o.total}
                validees={o.validees}
                rejetees={o.rejetees}
                taux={o.taux}
                derniereAction={o.derniereAction}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .officier-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
