import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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

  // ✅ Calculé à chaque requête — pas au build
  const now = new Date();
  const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const cutoff72h = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const [
    enAttente,
    validees,
    rejetees,
    recentes,
    declarationsUrgentes,
    declarationLaPlusAncienne,
  ] = await Promise.all([
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
    // Urgentes : entre 48h et 72h
    prisma.declaration.count({
      where: {
        statut: "EN_ATTENTE",
        createdAt: { lte: cutoff48h, gte: cutoff72h },
      },
    }),
    // La plus ancienne urgente pour redirection directe
    prisma.declaration.findFirst({
      where: {
        statut: "EN_ATTENTE",
        createdAt: { lte: cutoff48h },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }),
  ]);

  // Deadline dépassée (+72h)
  const declarationsEnRetard = await prisma.declaration.count({
    where: {
      statut: "EN_ATTENTE",
      createdAt: { lte: cutoff72h },
    },
  });

  const totalUrgentes = declarationsUrgentes + declarationsEnRetard;

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

        {/* ── Badge urgent clignotant ── */}
        {totalUrgentes > 0 && (
          <>
            <style>{`
              @keyframes urgentPulse {
                0%, 100% {
                  border-color: rgba(239,68,68,0.25);
                  box-shadow: 0 0 0 0 rgba(239,68,68,0);
                  background: rgba(239,68,68,0.08);
                }
                50% {
                  border-color: rgba(239,68,68,0.7);
                  box-shadow: 0 0 0 6px rgba(239,68,68,0.08);
                  background: rgba(239,68,68,0.15);
                }
              }
              @keyframes dotBlink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>

            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                animation: "urgentPulse 2s ease-in-out infinite",
              }}
            >
              {/* Point clignotant */}
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  flexShrink: 0,
                  animation: "dotBlink 1s ease-in-out infinite",
                  boxShadow: "0 0 6px rgba(239,68,68,0.8)",
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#f87171",
                  }}
                >
                  ⚠️ {totalUrgentes} déclaration{totalUrgentes > 1 ? "s" : ""}{" "}
                  nécessite{totalUrgentes > 1 ? "nt" : ""} une attention urgente
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: "0.2rem",
                  }}
                >
                  {declarationsEnRetard > 0 && (
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>
                      {declarationsEnRetard} deadline dépassée (+72h)
                    </span>
                  )}
                  {declarationsEnRetard > 0 &&
                    declarationsUrgentes > 0 &&
                    " · "}
                  {declarationsUrgentes > 0 && (
                    <span>
                      {declarationsUrgentes} proche
                      {declarationsUrgentes > 1 ? "s" : ""} de la deadline
                      (48–72h)
                    </span>
                  )}
                </div>
              </div>

              {/* Bouton — pointe vers la déclaration la plus ancienne */}
              <Link
                href={
                  declarationLaPlusAncienne
                    ? `/officier/declaration/${declarationLaPlusAncienne.id}`
                    : "/officier/declaration?statut=EN_ATTENTE"
                }
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  textDecoration: "none",
                  border: "1px solid rgba(239,68,68,0.35)",
                  padding: "0.35rem 0.875rem",
                  borderRadius: "6px",
                  flexShrink: 0,
                  fontWeight: 500,
                }}
              >
                Traiter →
              </Link>
            </div>
          </>
        )}

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
