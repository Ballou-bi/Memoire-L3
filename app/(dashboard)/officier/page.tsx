import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import QueueRow from "@/components/dashboard/QueueRow";
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
        {/* ── Stats 3 colonnes ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
          className="stats-grid-3"
        >
          <StatsCard
            label="En attente"
            value={enAttente}
            color="orange"
            featured={true}
            sub="à traiter"
          />
          <StatsCard
            label="Validées par moi"
            value={validees}
            color="green"
            sub="traitées"
          />
          <StatsCard
            label="Rejetées par moi"
            value={rejetees}
            color="dark"
            sub="refusées"
          />
        </div>

        {/* ── File d'attente ── */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "white",
                  margin: 0,
                }}
              >
                File d&apos;attente
              </h2>
              <p
                style={{
                  fontSize: "0.73rem",
                  color: "rgba(255,255,255,0.3)",
                  margin: "0.2rem 0 0",
                }}
              >
                {enAttente} déclaration{enAttente > 1 ? "s" : ""} à traiter ·
                par ordre d&apos;arrivée
              </p>
            </div>
            {enAttente > 0 && (
              <span
                style={{
                  background: "rgba(249,115,22,0.15)",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.3)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                }}
              >
                {enAttente} en attente
              </span>
            )}
          </div>

          {recentes.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "2rem",
              }}
            >
              <EmptyState
                title="Aucune déclaration en attente"
                subtitle="Toutes les déclarations ont été traitées."
              />
            </div>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {/* Header tableau */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1.2fr 1.5fr 1fr 100px",
                  padding: "0.75rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}
                className="queue-header"
              >
                {[
                  "Enfant",
                  "Date de naissance",
                  "Lieu",
                  "Demandé par",
                  "Soumis le",
                  "Action",
                ].map((h) => (
                  <div
                    key={h}
                    style={{
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.28)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Lignes — composant client pour le hover */}
              {recentes.map((d, i) => (
                <QueueRow
                  key={d.id}
                  id={d.id}
                  prenomEnfant={d.prenomEnfant}
                  nomEnfant={d.nomEnfant}
                  dateNaissance={formatDate(d.dateNaissance)}
                  lieuNaissance={d.lieuNaissance}
                  citoyenPrenom={d.citoyen.prenom}
                  citoyenNom={d.citoyen.nom}
                  createdAt={formatDate(d.createdAt)}
                  isLast={i === recentes.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .queue-header { display: none !important; }
          .queue-row {
            grid-template-columns: 1fr !important;
            gap: 0.5rem;
            padding: 1rem !important;
          }
        }
      `}</style>
    </>
  );
}
