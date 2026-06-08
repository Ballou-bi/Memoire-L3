import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistiques — Officier" };

export default async function OfficierStatsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role === "CITOYEN") redirect("/citoyen");

  const [
    totalDeclarations,
    enAttente,
    validees,
    rejetees,
    totalExtraits,
    valideesParMoi,
    rejeteesParMoi,
    dernieresActions,
  ] = await Promise.all([
    prisma.declaration.count(),
    prisma.declaration.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.declaration.count({ where: { statut: "VALIDEE" } }),
    prisma.declaration.count({ where: { statut: "REJETEE" } }),
    prisma.extrait.count(),
    prisma.declaration.count({
      where: { statut: "VALIDEE", officierId: user.id },
    }),
    prisma.declaration.count({
      where: { statut: "REJETEE", officierId: user.id },
    }),
    prisma.declaration.findMany({
      where: { officierId: user.id },
      include: { citoyen: { select: { nom: true, prenom: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const tauxValidationGlobal =
    totalDeclarations > 0
      ? Math.round((validees / totalDeclarations) * 100)
      : 0;

  const tauxValidationPersonnel =
    valideesParMoi + rejeteesParMoi > 0
      ? Math.round((valideesParMoi / (valideesParMoi + rejeteesParMoi)) * 100)
      : 0;

  return (
    <>
      <Header
        title="Statistiques"
        subtitle="Vue d'ensemble de l'activité de la plateforme"
      />

      <div className="db-content animate-fade-up">
        {/* ── Vue globale ── */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--bg-card)",
              opacity: 0.7,
            }}
          >
            Vue globale
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "1rem",
          }}
          className="officier-stats-grid"
        >
          <StatsCard
            label="Total déclarations"
            value={totalDeclarations}
            color="orange"
          />
          <StatsCard
            label="En attente"
            value={enAttente}
            color="green"
            sub="À traiter"
          />
          <StatsCard
            label="Validées"
            value={validees}
            color="green"
            sub={`${tauxValidationGlobal}% du total`}
          />
          <StatsCard label="Rejetées" value={rejetees} color="dark" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
          className="officier-stats-grid"
        >
          <StatsCard
            label="Extraits délivrés"
            value={totalExtraits}
            color="orange"
            sub="Sur toutes les déclarations validées"
          />
          <StatsCard
            label="Taux de validation global"
            value={`${tauxValidationGlobal}%`}
            color="green"
          />
        </div>

        {/* ── Mon activité ── */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--bg-card)",
              opacity: 0.7,
            }}
          >
            Mon activité
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
          className="officier-stats-grid"
        >
          <StatsCard
            label="Validées par moi"
            value={valideesParMoi}
            color="green"
          />
          <StatsCard
            label="Rejetées par moi"
            value={rejeteesParMoi}
            color="white"
          />
          <StatsCard
            label="Mon taux de validation"
            value={`${tauxValidationPersonnel}%`}
            color="orange"
            sub={`Sur ${valideesParMoi + rejeteesParMoi} dossier${valideesParMoi + rejeteesParMoi > 1 ? "s" : ""} traité${valideesParMoi + rejeteesParMoi > 1 ? "s" : ""}`}
          />
        </div>

        {/* ── Dernières actions ── */}
        {dernieresActions.length > 0 && (
          <section>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Mes dernières actions
            </h2>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: "500px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.1)",
                      background: "rgba(255,255,255,0.02)",
                      color: "var(--bg-card)",
                    }}
                  >
                    {["Enfant", "Citoyen", "Décision", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontSize: "0.62rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--bg-card)",
                          opacity: 0.7,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dernieresActions.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom:
                          i < dernieresActions.length - 1
                            ? "1px solid rgba(201,168,76,0.06)"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontWeight: 500,
                          fontSize: "0.88rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.prenomEnfant} {d.nomEnfant}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.citoyen.prenom} {d.citoyen.nom}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            padding: "0.2rem 0.65rem",
                            borderRadius: "2px",
                            background:
                              d.statut === "VALIDEE"
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(239,68,68,0.1)",
                            color:
                              d.statut === "VALIDEE" ? "#4ade80" : "#f87171",
                          }}
                        >
                          {d.statut === "VALIDEE" ? "✓ Validée" : "✗ Rejetée"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.78rem",
                          opacity: 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(d.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {dernieresActions.length === 0 && (
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
            Vous n&apos;avez pas encore traité de déclaration.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .officier-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
