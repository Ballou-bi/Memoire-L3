import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { StatusBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Déclarations — Officier" };

interface Props {
  searchParams: Promise<{ statut?: string; page?: string }>;
}

export default async function OfficierDeclarationsPage({
  searchParams,
}: Props) {
  const { statut: filterStatut, page: pageStr } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role === "CITOYEN") redirect("/citoyen");

  const page = parseInt(pageStr ?? "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (
    filterStatut &&
    ["EN_ATTENTE", "VALIDEE", "REJETEE"].includes(filterStatut)
  ) {
    where.statut = filterStatut;
  }

  const [declarations, total] = await Promise.all([
    prisma.declaration.findMany({
      where,
      include: {
        citoyen: { select: { nom: true, prenom: true, email: true } },
        officier: { select: { nom: true, prenom: true } },
        acte: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.declaration.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(totalPages - 1, page + 1);
      p++
    ) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const paginationUrl = (p: number) =>
    `/officier/declaration?page=${p}${filterStatut ? `&statut=${filterStatut}` : ""}`;

  const FILTRES = [
    { label: "Toutes", value: "" },
    { label: "En attente", value: "EN_ATTENTE" },
    { label: "Validées", value: "VALIDEE" },
    { label: "Rejetées", value: "REJETEE" },
  ];

  return (
    <>
      <style>{`
        .decl-table { display: block; }
        .decl-cards { display: none; }
        @media (max-width: 768px) {
          .decl-table { display: none; }
          .decl-cards { display: flex; flex-direction: column; gap: 0.75rem; }
        }
      `}</style>

      <Header
        title="Déclarations"
        subtitle={`${total} déclaration${total > 1 ? "s" : ""} au total`}
      />

      <div className="db-content animate-fade-up">
        {/* Filtres */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {FILTRES.map((f) => (
            <Link
              key={f.value}
              href={`/officier/declaration${f.value ? `?statut=${f.value}` : ""}`}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "2px",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                fontWeight: 500,
                background:
                  filterStatut === f.value || (!filterStatut && f.value === "")
                    ? "var(--bg-card)"
                    : "rgba(255,255,255,0.04)",
                color:
                  filterStatut === f.value || (!filterStatut && f.value === "")
                    ? "var(--navy)"
                    : "var(--cream)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {declarations.length === 0 ? (
          <EmptyState
            title="Aucune déclaration"
            subtitle="Aucune déclaration ne correspond à ce filtre."
          />
        ) : (
          <>
            {/* ── TABLE DESKTOP ── */}
            <div
              className="decl-table"
              style={{
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "7%" }} />
                </colgroup>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.1)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {[
                      "Enfant",
                      "Date naiss.",
                      "Lieu",
                      "Citoyen",
                      "Statut",
                      "N° Acte",
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
                          color: "var(--bg-card)",
                          opacity: 0.7,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {declarations.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom:
                          i < declarations.length - 1
                            ? "1px solid rgba(201,168,76,0.06)"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "var(--bg-card)",
                        }}
                      >
                        {d.prenomEnfant} {d.nomEnfant}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.8rem",
                          opacity: 0.65,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatDate(d.dateNaissance)}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.8rem",
                          opacity: 0.65,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "var(--bg-card)",
                        }}
                      >
                        {d.lieuNaissance}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.8rem",
                          opacity: 0.65,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {d.citoyen.prenom} {d.citoyen.nom}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge statut={d.statut} />
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.72rem",
                          color: "#009a44",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "monospace",
                        }}
                      >
                        {d.acte?.numero ?? "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {d.statut === "EN_ATTENTE" ? (
                          <Link
                            href={`/officier/declaration/${d.id}`}
                            style={{
                              display: "inline-block",
                              background: "rgba(247,127,0,0.1)",
                              border: "1px solid rgba(247,127,0,0.3)",
                              color: "#f77f00",
                              padding: "0.3rem 0.75rem",
                              borderRadius: "2px",
                              textDecoration: "none",
                              fontSize: "0.72rem",
                              fontWeight: 500,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Traiter →
                          </Link>
                        ) : (
                          <Link
                            href={`/officier/declaration/${d.id}`}
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ci-orange) ",
                              textDecoration: "none",
                              opacity: 0.5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Voir →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CARDS MOBILE ── */}
            <div className="decl-cards">
              {declarations.map((d) => (
                <Link
                  key={d.id}
                  href={`/officier/declaration/${d.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      borderRadius: "12px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                    }}
                  >
                    {/* Ligne 1 — nom enfant + statut */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.92rem",
                          color: "white",
                        }}
                      >
                        {d.prenomEnfant} {d.nomEnfant}
                      </span>
                      <StatusBadge statut={d.statut} />
                    </div>

                    {/* Ligne 2 — date + lieu */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      <span>📅 {formatDate(d.dateNaissance)}</span>
                      <span>📍 {d.lieuNaissance}</span>
                    </div>

                    {/* Ligne 3 — citoyen */}
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      👤 {d.citoyen.prenom} {d.citoyen.nom}
                    </div>

                    {/* Ligne 4 — acte + bouton */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "#009a44",
                          fontFamily: "monospace",
                          fontWeight: 500,
                        }}
                      >
                        {d.acte?.numero ?? "Pas encore d'acte"}
                      </span>
                      {d.statut === "EN_ATTENTE" && (
                        <span
                          style={{
                            background: "rgba(247,127,0,0.12)",
                            border: "1px solid rgba(247,127,0,0.35)",
                            color: "#f77f00",
                            padding: "0.3rem 0.875rem",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          Traiter →
                        </span>
                      )}
                      {d.statut !== "EN_ATTENTE" && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--ci-orange) ",
                          }}
                        >
                          Voir →
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  justifyContent: "center",
                  marginTop: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {page > 1 && (
                  <Link
                    href={paginationUrl(page - 1)}
                    style={{
                      padding: "0 0.75rem",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "2px",
                      fontSize: "0.8rem",
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--cream)",
                      border: "1px solid rgba(201,168,76,0.2)",
                    }}
                  >
                    ← Préc.
                  </Link>
                )}
                {getPages().map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={paginationUrl(p as number)}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "2px",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        background:
                          p === page ? "#f77f00" : "rgba(255,255,255,0.04)",
                        color: p === page ? "#ffffff" : "var(--cream)",
                        border:
                          p === page
                            ? "1px solid #f77f00"
                            : "1px solid rgba(201,168,76,0.2)",
                        fontWeight: p === page ? 600 : 400,
                      }}
                    >
                      {p}
                    </Link>
                  ),
                )}
                {page < totalPages && (
                  <Link
                    href={paginationUrl(page + 1)}
                    style={{
                      padding: "0 0.75rem",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "2px",
                      fontSize: "0.8rem",
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--cream)",
                      border: "1px solid rgba(201,168,76,0.2)",
                    }}
                  >
                    Suiv. →
                  </Link>
                )}
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.3)",
                    marginLeft: "0.5rem",
                  }}
                >
                  Page {page} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
