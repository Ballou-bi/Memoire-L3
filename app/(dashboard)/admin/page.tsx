import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import AdminQuickCard from "./AdminQuickCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminDashboard() {
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
    recentesDeclarations,
    recentesUsers,
  ] = await Promise.all([
    prisma.declaration.count(),
    prisma.declaration.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.declaration.count({ where: { statut: "VALIDEE" } }),
    prisma.declaration.count({ where: { statut: "REJETEE" } }),
    prisma.extrait.count(),
    prisma.user.count({ where: { role: "CITOYEN" } }),
    prisma.user.count({ where: { role: "OFFICIER" } }),
    prisma.declaration.findMany({
      include: { citoyen: { select: { nom: true, prenom: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const QUICK_CARDS = [
    {
      label: "Gérer les utilisateurs",
      href: "/admin/users",
      desc: "Attribuer les rôles officier/admin",
    },
    {
      label: "Toutes les déclarations",
      href: "/admin/declarations",
      desc: "Voir et gérer toutes les déclarations",
    },
    {
      label: "Tous les extraits",
      href: "/admin/extraits",
      desc: "Historique des extraits délivrés",
    },
  ];

  return (
    <>
      <Header
        title="Administration"
        subtitle="Vue globale de la plateforme waya"
      />

      <div className="db-content animate-fade-up">
        {/* ── Stats — 7 cartes en 1 seul grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
          className="admin-stats-grid"
        >
          <StatsCard
            label="Total déclarations"
            value={totalDeclarations}
            color="orange"
          />
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
            sub={`${totalDeclarations > 0 ? Math.round((validees / totalDeclarations) * 100) : 0}%`}
          />
          <StatsCard label="Rejetées" value={rejetees} color="dark" />
          <StatsCard
            label="Extraits délivrés"
            value={totalExtraits}
            color="green"
          />
          <StatsCard
            label="Citoyens inscrits"
            value={totalCitoyens}
            color="orange"
          />
          <StatsCard
            label="Officiers actifs"
            value={totalOfficiers}
            color="white"
          />
        </div>

        {/* ── Quick cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
          className="admin-quick-grid"
        >
          {QUICK_CARDS.map((card) => (
            <AdminQuickCard key={card.href} {...card} />
          ))}
        </div>

        {/* ── Déclarations + Utilisateurs ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
          className="admin-bottom-grid"
        >
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "var(--bg-card)",
                }}
              >
                Déclarations récentes
              </h2>
              <Link
                href="/admin/declarations"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--bg-card)",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                Voir tout →
              </Link>
            </div>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {recentesDeclarations.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    padding: "0.875rem 1rem",
                    borderBottom:
                      i < recentesDeclarations.length - 1
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
                        marginTop: "0.15rem",
                        color: "var(--bg-card)",
                      }}
                    >
                      par {d.citoyen.prenom} {d.citoyen.nom} ·{" "}
                      {formatDate(d.createdAt)}
                    </div>
                  </div>
                  <StatusBadge statut={d.statut} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "var(--bg-card)",
                }}
              >
                Nouveaux utilisateurs
              </h2>
              <Link
                href="/admin/users"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--bg-card)",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                Gérer →
              </Link>
            </div>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {recentesUsers.map((u, i) => (
                <div
                  key={u.id}
                  style={{
                    padding: "0.875rem 1rem",
                    borderBottom:
                      i < recentesUsers.length - 1
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
                      {u.prenom} {u.nom}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        opacity: 0.45,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--bg-card)",
                      }}
                    >
                      {u.email}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "2px",
                      background:
                        u.role === "ADMIN"
                          ? "rgba(239,68,68,0.1)"
                          : u.role === "OFFICIER"
                            ? "rgba(201,168,76,0.1)"
                            : "rgba(255,255,255,0.06)",
                      color:
                        u.role === "ADMIN"
                          ? "#f87171"
                          : u.role === "OFFICIER"
                            ? "var(--gold)"
                            : "rgba(248,244,237,0.6)",
                      flexShrink: 0,
                    }}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .admin-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .admin-quick-grid {
      grid-template-columns: 1fr !important;
    }
    .admin-bottom-grid {
      grid-template-columns: 1fr !important;
    }
  }
`}</style>
    </>
  );
}
