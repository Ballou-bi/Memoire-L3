import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import DeclarationRow from "@/components/dashboard/DeclarationRow";
import { StatusBadge, Button, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon espace" };

export default async function CitoyenDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      declarations: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { acte: true },
      },
      extraits: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!user) redirect("/sign-in");
  if (user.role === "OFFICIER") redirect("/officier");
  if (user.role === "ADMIN") redirect("/admin");

  const total = await prisma.declaration.count({
    where: { citoyenId: user.id },
  });
  const validees = await prisma.declaration.count({
    where: { citoyenId: user.id, statut: "VALIDEE" },
  });
  const enAttente = await prisma.declaration.count({
    where: { citoyenId: user.id, statut: "EN_ATTENTE" },
  });
  const totalExtraits = await prisma.extrait.count({
    where: { userId: user.id },
  });

  return (
    <>
      <Header
        title={`Bonjour, ${user.prenom}`}
        subtitle="Gérez vos déclarations et extraits de naissance"
        actions={
          <Link href="/citoyen/declaration/new">
            <Button size="sm">+ Nouvelle</Button>
          </Link>
        }
      />

      <div className="db-content animate-fade-up">
        {/* ── Stats 4 colonnes ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
          className="stats-grid"
        >
          <StatsCard
            label="Total Déclarations"
            value={total}
            color="green"
            featured={true}
            sub="ce mois"
          />
          <StatsCard
            label="Validées"
            value={validees}
            color="green"
            sub="enregistrées"
          />
          <StatsCard
            label="En attente"
            value={enAttente}
            color="orange"
            sub="en traitement"
          />
          <StatsCard
            label="Mes extraits"
            value={totalExtraits}
            color="orange"
            sub="disponibles"
          />
        </div>

        {/* ── Grille 2 colonnes ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "1.25rem",
            alignItems: "start",
          }}
          className="dashboard-grid"
        >
          {/* ── Déclarations récentes ── */}
          <section>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "white",
                      margin: 0,
                    }}
                  >
                    Déclarations récentes
                  </h2>
                  <p
                    style={{
                      fontSize: "0.73rem",
                      color: "rgba(255,255,255,0.3)",
                      margin: "0.2rem 0 0",
                    }}
                  >
                    Vos 5 dernières déclarations
                  </p>
                </div>
                <Link
                  href="/citoyen/declaration"
                  style={{
                    fontSize: "0.78rem",
                    color: "#f97316",
                    textDecoration: "none",
                    opacity: 0.85,
                  }}
                >
                  Voir tout →
                </Link>
              </div>

              {user.declarations.length === 0 ? (
                <div style={{ padding: "2rem" }}>
                  <EmptyState
                    title="Aucune déclaration"
                    subtitle="Commencez par déclarer une naissance en ligne."
                    action={
                      <Link href="/citoyen/declaration/new">
                        <Button size="sm">Faire une déclaration</Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div
                    className="declarations-mobile"
                    style={{
                      display: "none",
                      flexDirection: "column",
                      gap: "0.75rem",
                      padding: "1rem",
                    }}
                  >
                    {user.declarations.map((d) => (
                      <Link
                        key={d.id}
                        href={`/citoyen/declaration/${d.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "10px",
                            padding: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: "0.9rem",
                                color: "white",
                              }}
                            >
                              {d.prenomEnfant} {d.nomEnfant}
                            </div>
                            <StatusBadge statut={d.statut} />
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {formatDate(d.dateNaissance)} · {d.lieuNaissance}
                          </div>
                          {d.acte && (
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "#f97316",
                                opacity: 0.7,
                                marginTop: "0.3rem",
                              }}
                            >
                              N° {d.acte.numero}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Desktop — composant client pour le hover */}
                  <div className="declarations-desktop">
                    {user.declarations.map((d, i) => (
                      <DeclarationRow
                        key={d.id}
                        id={d.id}
                        prenomEnfant={d.prenomEnfant}
                        nomEnfant={d.nomEnfant}
                        dateNaissance={formatDate(d.dateNaissance)}
                        lieuNaissance={d.lieuNaissance}
                        acteNumero={d.acte?.numero ?? null}
                        statut={<StatusBadge statut={d.statut} />}
                        isLast={i === user.declarations.length - 1}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Colonne droite ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Extraits récents */}
            {user.extraits.length > 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "white",
                      margin: 0,
                    }}
                  >
                    Derniers extraits
                  </h3>
                  <Link
                    href="/citoyen/extraits"
                    style={{
                      fontSize: "0.75rem",
                      color: "#f97316",
                      textDecoration: "none",
                      opacity: 0.8,
                    }}
                  >
                    Voir tout →
                  </Link>
                </div>
                {user.extraits.map((e, i) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.875rem 1.25rem",
                      borderBottom:
                        i < user.extraits.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          color: "white",
                          marginBottom: "0.18rem",
                        }}
                      >
                        {e.type.replace(/_/g, " ")}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {formatDate(e.createdAt)}
                      </div>
                    </div>
                    <a
                      href={`/api/extraits/${e.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.72rem",
                        color: "#22c55e",
                        textDecoration: "none",
                        opacity: 0.85,
                      }}
                    >
                      ↓ PDF
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Statut compte */}
            <div
              style={{
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "14px",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  Compte vérifié
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {user.prenom} {user.nom}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .declarations-desktop { display: none !important; }
          .declarations-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
