import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import DeclarationCard from "@/components/dashboard/DeclarationCard";
import { StatusBadge, Button, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes déclarations" };

export default async function CitoyenDeclarationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "CITOYEN") redirect("/citoyen");

  const declarations = await prisma.declaration.findMany({
    where: { citoyenId: user.id },
    include: { acte: true, _count: { select: { extraits: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Mes déclarations"
        subtitle={`${declarations.length} déclaration${declarations.length > 1 ? "s" : ""} au total`}
        actions={
          <Link href="/citoyen/declaration/new">
            <Button size="sm">+ Nouvelle</Button>
          </Link>
        }
      />

      <div className="db-content animate-fade-up">
        {declarations.length === 0 ? (
          <EmptyState
            title="Aucune déclaration"
            subtitle="Déclarez une naissance pour obtenir un acte officiel."
            action={
              <Link href="/citoyen/declaration/new">
                <Button>Faire ma première déclaration</Button>
              </Link>
            }
          />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {declarations.map((d) => (
              <DeclarationCard
                key={d.id}
                id={d.id}
                prenomEnfant={d.prenomEnfant}
                nomEnfant={d.nomEnfant}
                dateNaissance={formatDate(d.dateNaissance)}
                lieuNaissance={d.lieuNaissance}
                statut={d.statut}
                acteNumero={d.acte?.numero ?? null}
                extraitsCount={d._count.extraits}
                statusBadge={<StatusBadge statut={d.statut} />}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
