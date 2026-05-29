import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistiques — Admin" };

export default async function AdminStatsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const [
    totalDeclarations,
    enAttente,
    validees,
    rejetees,
    totalExtraits,
    totalCitoyens,
    totalOfficiers,
    totalAdmins,
    dernieresDeclarations,
    officiersStats,
  ] = await Promise.all([
    prisma.declaration.count(),
    prisma.declaration.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.declaration.count({ where: { statut: "VALIDEE" } }),
    prisma.declaration.count({ where: { statut: "REJETEE" } }),
    prisma.extrait.count(),
    prisma.user.count({ where: { role: "CITOYEN" } }),
    prisma.user.count({ where: { role: "OFFICIER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    // 8 dernières déclarations
    prisma.declaration.findMany({
      include: {
        citoyen: { select: { nom: true, prenom: true } },
        officier: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Performance par officier
    prisma.user.findMany({
      where: { role: "OFFICIER" },
      select: {
        id: true,
        nom: true,
        prenom: true,
        _count: {
          select: { validations: true },
        },
      },
    }),
  ]);

  const tauxValidation =
    totalDeclarations > 0
      ? Math.round((validees / totalDeclarations) * 100)
      : 0;

  const tauxRejet =
    totalDeclarations > 0
      ? Math.round((rejetees / totalDeclarations) * 100)
      : 0;

  return (
    <>
      <Header
        title="Statistiques"
        subtitle="Vue d'ensemble complète de la plateforme"
      />

      <div className="db-content animate-fade-up">
        {/* Déclarations */}
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
            Déclarations
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <StatsCard label="Total" value={totalDeclarations} color="orange" />
          <StatsCard
            label="En attente"
            value={enAttente}
            color="white"
            sub="À traiter"
          />
          <StatsCard
            label="Validées"
            value={validees}
            color="green"
            sub={`${tauxValidation}% du total`}
          />
          <StatsCard
            label="Rejetées"
            value={rejetees}
            color="dark"
            sub={`${tauxRejet}% du total`}
          />
        </div>

        {/* Utilisateurs & extraits */}
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
            Utilisateurs & extraits
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <StatsCard
            label="Citoyens inscrits"
            value={totalCitoyens}
            color="green"
          />
          <StatsCard
            label="Officiers actifs"
            value={totalOfficiers}
            color="white"
          />
          <StatsCard
            label="Administrateurs"
            value={totalAdmins}
            color="white"
          />
          <StatsCard
            label="Extraits délivrés"
            value={totalExtraits}
            color="green"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Dernières déclarations */}
          <section>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 600,
                marginBottom: "1rem",
                // color: "var(--bg-card)",
              }}
            >
              Dernières déclarations
            </h2>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
                color: "var(--bg-card)",
              }}
            >
              {dernieresDeclarations.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    opacity: 0.4,
                    fontSize: "0.82rem",
                    color: "var(--bg-card)",
                  }}
                >
                  Aucune déclaration
                </div>
              ) : (
                dernieresDeclarations.map((d, i) => (
                  <div
                    key={d.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom:
                        i < dernieresDeclarations.length - 1
                          ? "1px solid rgba(201,168,76,0.06)"
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {d.prenomEnfant} {d.nomEnfant}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          opacity: 0.45,
                          marginTop: "0.1rem",
                        }}
                      >
                        {d.citoyen.prenom} {d.citoyen.nom} ·{" "}
                        {formatDate(d.createdAt)}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "2px",
                        flexShrink: 0,
                        background:
                          d.statut === "VALIDEE"
                            ? "rgba(34,197,94,0.1)"
                            : d.statut === "REJETEE"
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(201,168,76,0.1)",
                        color:
                          d.statut === "VALIDEE"
                            ? "#4ade80"
                            : d.statut === "REJETEE"
                              ? "#f87171"
                              : "var(--gold)",
                      }}
                    >
                      {d.statut === "EN_ATTENTE"
                        ? "En attente"
                        : d.statut === "VALIDEE"
                          ? "Validée"
                          : "Rejetée"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Performance officiers */}
          <section>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Performance des officiers
            </h2>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {officiersStats.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    opacity: 0.4,
                    fontSize: "0.82rem",
                  }}
                >
                  Aucun officier enregistré
                </div>
              ) : (
                officiersStats.map((o, i) => (
                  <div
                    key={o.id}
                    style={{
                      padding: "0.875rem 1rem",
                      borderBottom:
                        i < officiersStats.length - 1
                          ? "1px solid rgba(201,168,76,0.06)"
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                      {o.prenom} {o.nom}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "var(-ci-orange)",
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        {o._count.validations}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          opacity: 0.4,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        dossiers traités
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
