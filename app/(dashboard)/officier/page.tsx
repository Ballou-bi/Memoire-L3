import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Espace Officier" };

export default async function OfficierDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || (user.role !== "OFFICIER" && user.role !== "ADMIN"))
    redirect("/citoyen");

  const [enAttente, validees, rejetees, recentes] = await Promise.all([
    prisma.declaration.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.declaration.count({
      where: { statut: "VALIDEE", officierId: user.id },
    }),
    prisma.declaration.count({
      where: { statut: "REJETEE", officierId: user.id },
    }),
    prisma.declaration.findMany({
      where: { statut: "EN_ATTENTE" },
      include: {
        citoyen: { select: { nom: true, prenom: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <Header
        title={`Bonjour, ${user.prenom}`}
        subtitle="Déclarations en attente de validation"
      />

      <div className="db-content animate-fade-up">
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <StatsCard
            label="En attente"
            value={enAttente}
            color="gold"
            sub="À traiter"
          />
          <StatsCard label="Validées par moi" value={validees} color="green" />
          <StatsCard label="Rejetées par moi" value={rejetees} color="red" />
        </div>

        {/* File d'attente */}
        <section>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            File d&lsquo;attente ({enAttente})
          </h2>

          {recentes.length === 0 ? (
            <EmptyState
              title="Aucune déclaration en attente"
              subtitle="Toutes les déclarations ont été traitées."
            />
          ) : (
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.1)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {[
                      "Enfant",
                      "Date de naissance",
                      "Lieu",
                      "Demandé par",
                      "Soumis le",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontSize: "0.62rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--gold)",
                          opacity: 0.7,
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom:
                          i < recentes.length - 1
                            ? "1px solid rgba(201,168,76,0.06)"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontWeight: 500,
                          fontSize: "0.88rem",
                        }}
                      >
                        {d.prenomEnfant} {d.nomEnfant}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                        }}
                      >
                        {formatDate(d.dateNaissance)}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                        }}
                      >
                        {d.lieuNaissance}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                        }}
                      >
                        {d.citoyen.prenom} {d.citoyen.nom}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.78rem",
                          opacity: 0.5,
                        }}
                      >
                        {formatDate(d.createdAt)}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <Link
                          href={`/officier/declaration/${d.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: "rgba(201,168,76,0.1)",
                            border: "1px solid rgba(201,168,76,0.25)",
                            color: "var(--gold)",
                            padding: "0.35rem 0.875rem",
                            borderRadius: "2px",
                            textDecoration: "none",
                            fontSize: "0.72rem",
                            fontWeight: 500,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Traiter →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
