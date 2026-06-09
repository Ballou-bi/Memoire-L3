import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate, TYPE_EXTRAIT_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tous les extraits" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminExtraitsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const page = parseInt(pageStr ?? "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const [extraits, total] = await Promise.all([
    prisma.extrait.findMany({
      include: {
        declaration: {
          select: {
            nomEnfant: true,
            prenomEnfant: true,
            dateNaissance: true,
            acte: { select: { numero: true } },
          },
        },
        user: { select: { nom: true, prenom: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.extrait.count(),
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

  const paginationUrl = (p: number) => `/admin/extraits?page=${p}`;

  return (
    <>
      <style>{`
        .extraits-table { display: block; }
        .extraits-cards { display: none; }
        @media (max-width: 1000px) {
          .extraits-table { display: none; }
          .extraits-cards { display: flex; flex-direction: column; gap: 0.75rem; }
        }
      `}</style>

      <Header
        title="Tous les extraits"
        subtitle={`${total} extrait${total > 1 ? "s" : ""} délivré${total > 1 ? "s" : ""}`}
      />

      <div className="db-content animate-fade-up">
        {extraits.length === 0 ? (
          <EmptyState
            title="Aucun extrait"
            subtitle="Aucun extrait n'a encore été demandé."
          />
        ) : (
          <>
            {/* ── TABLE DESKTOP ── */}
            <div
              className="extraits-table"
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
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "13%" }} />
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
                      "N° Acte",
                      "Type",
                      "Demandé par",
                      "Date",
                      "PDF",
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
                  {extraits.map((e, i) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom:
                          i < extraits.length - 1
                            ? "1px solid rgba(201,168,76,0.06)"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.declaration.prenomEnfant} {e.declaration.nomEnfant}
                        <div
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.45,
                            marginTop: "0.15rem",
                            color: "var(--bg-card)",
                          }}
                        >
                          Né(e) le {formatDate(e.declaration.dateNaissance)}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.75rem",
                          color: "#009a44",
                          fontWeight: 500,
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.declaration.acte?.numero ?? "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <Badge color="orange">
                          {TYPE_EXTRAIT_LABELS[e.type] ?? e.type}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.user.prenom} {e.user.nom}
                        <div
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.6,
                            color: "var(--bg-card)",
                          }}
                        >
                          {e.user.email}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.78rem",
                          opacity: 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(e.createdAt)}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          textAlign: "center",
                        }}
                      >
                        <a
                          href={`/api/extraits/${e.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.72rem",
                            color: "#f77f00",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          ↓ PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CARDS MOBILE ── */}
            <div className="extraits-cards">
              {extraits.map((e) => (
                <div
                  key={e.id}
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
                  {/* Ligne 1 — nom enfant + type */}
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
                      {e.declaration.prenomEnfant} {e.declaration.nomEnfant}
                    </span>
                    <Badge color="orange">
                      {TYPE_EXTRAIT_LABELS[e.type] ?? e.type}
                    </Badge>
                  </div>

                  {/* Ligne 2 — date naissance */}
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    🎂 Né(e) le {formatDate(e.declaration.dateNaissance)}
                  </div>

                  {/* Ligne 3 — N° acte */}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#009a44",
                      fontFamily: "monospace",
                      fontWeight: 500,
                    }}
                  >
                    {e.declaration.acte?.numero ?? "Pas encore d'acte"}
                  </div>

                  {/* Ligne 4 — demandé par */}
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "rgba(255,255,255,0.45)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    👤 {e.user.prenom} {e.user.nom} · {e.user.email}
                  </div>

                  {/* Ligne 5 — date + PDF */}
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
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      📅 {formatDate(e.createdAt)}
                    </span>
                    <a
                      href={`/api/extraits/${e.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "rgba(247,127,0,0.1)",
                        border: "1px solid rgba(247,127,0,0.3)",
                        color: "#f77f00",
                        padding: "0.3rem 0.875rem",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      ↓ Télécharger PDF
                    </a>
                  </div>
                </div>
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
