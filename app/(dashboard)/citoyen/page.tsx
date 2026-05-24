import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
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
        {/* ── Stats ── responsive 2 colonnes sur mobile, 4 sur desktop */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
          className="stats-grid"
        >
          <StatsCard label="Déclarations" value={total} color="gold" />
          <StatsCard label="Validées" value={validees} color="green" />
          <StatsCard label="En attente" value={enAttente} color="blue" />
          <StatsCard label="Extraits" value={totalExtraits} color="gold" />
        </div>

        {/* ── Déclarations récentes ── */}
        <section style={{ marginBottom: "2rem" }}>
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
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              Déclarations récentes
            </h2>
            <Link
              href="/citoyen/declaration"
              style={{
                fontSize: "0.78rem",
                color: "var(--gold)",
                textDecoration: "none",
                opacity: 0.8,
                whiteSpace: "nowrap",
              }}
            >
              Voir tout →
            </Link>
          </div>

          {user.declarations.length === 0 ? (
            <EmptyState
              title="Aucune déclaration"
              subtitle="Commencez par déclarer une naissance en ligne."
              action={
                <Link href="/citoyen/declaration/new">
                  <Button size="sm">Faire une déclaration</Button>
                </Link>
              }
            />
          ) : (
            <>
              {/* ── Version mobile — cards ── */}
              <div
                className="declarations-mobile"
                style={{
                  display: "none",
                  flexDirection: "column",
                  gap: "0.75rem",
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
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(201,168,76,0.1)",
                        borderRadius: "4px",
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
                        <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                          {d.prenomEnfant} {d.nomEnfant}
                        </div>
                        <StatusBadge statut={d.statut} />
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                        {formatDate(d.dateNaissance)} · {d.lieuNaissance}
                      </div>
                      {d.acte && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--gold)",
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

              {/* ── Version desktop — tableau ── */}
              <div
                className="declarations-desktop"
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
                        "Statut",
                        "N° Acte",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontSize: "0.65rem",
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
                    {user.declarations.map((d, i) => (
                      <tr
                        key={d.id}
                        style={{
                          borderBottom:
                            i < user.declarations.length - 1
                              ? "1px solid rgba(201,168,76,0.06)"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            fontSize: "0.85rem",
                            fontWeight: 500,
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
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <StatusBadge statut={d.statut} />
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            fontSize: "0.78rem",
                            color: "var(--gold)",
                            opacity: 0.7,
                          }}
                        >
                          {d.acte?.numero ?? "—"}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <Link
                            href={`/citoyen/declaration/${d.id}`}
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--gold)",
                              textDecoration: "none",
                            }}
                          >
                            Voir →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* ── Extraits récents ── */}
        {user.extraits.length > 0 && (
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
                  fontSize: "1.2rem",
                  fontWeight: 600,
                }}
              >
                Derniers extraits
              </h2>
              <Link
                href="/citoyen/extraits"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--gold)",
                  textDecoration: "none",
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                }}
              >
                Voir tout →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {user.extraits.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(201,168,76,0.1)",
                    borderRadius: "4px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--gold)",
                      opacity: 0.7,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {e.type.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.5 }}>
                    {formatDate(e.createdAt)}
                  </div>
                  <a
                    href={`/api/extraits/${e.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "0.75rem",
                      fontSize: "0.75rem",
                      color: "var(--gold)",
                      textDecoration: "none",
                    }}
                  >
                    ↓ Télécharger
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
