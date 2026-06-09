import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { formatDate } from "@/lib/utils";
import RoleChanger from "./RoleChanger";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestion des utilisateurs" };

interface Props {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { role: filterRole, search, page: pageStr } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const page = parseInt(pageStr ?? "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filterRole && ["CITOYEN", "OFFICIER", "ADMIN"].includes(filterRole)) {
    where.role = filterRole;
  }
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: "insensitive" } },
      { prenom: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        _count: { select: { declarations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
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
    `/admin/users?page=${p}${filterRole ? `&role=${filterRole}` : ""}${search ? `&search=${search}` : ""}`;

  const roleColor = (r: string) =>
    r === "ADMIN" ? "#f87171" : r === "OFFICIER" ? "#f77f00" : "#009a44";
  const roleBg = (r: string) =>
    r === "ADMIN"
      ? "rgba(239,68,68,0.12)"
      : r === "OFFICIER"
        ? "rgba(247,127,0,0.12)"
        : "rgba(0,154,68,0.12)";
  const roleBorder = (r: string) =>
    r === "ADMIN"
      ? "rgba(239,68,68,0.3)"
      : r === "OFFICIER"
        ? "rgba(247,127,0,0.3)"
        : "rgba(0,154,68,0.3)";

  const initiales = (prenom: string, nom: string) =>
    `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";

  const avatarColor = (nom: string) => {
    const colors = [
      { bg: "rgba(247,127,0,0.2)", text: "#f77f00" },
      { bg: "rgba(0,154,68,0.2)", text: "#009a44" },
      { bg: "rgba(179,223,197,0.2)", text: "#b3dfc5" },
      { bg: "rgba(247,127,0,0.15)", text: "#fddcb5" },
    ];
    const code = nom && nom.length > 0 ? nom.charCodeAt(0) : 0;
    return colors[code % colors.length] ?? colors[0];
  };

  return (
    <>
      <style>{`
        .users-table { display: block; }
        .users-cards { display: none; }
        @media (max-width: 1000px) {
          .users-table { display: none; }
          .users-cards { display: flex; flex-direction: column; gap: 0.75rem; }
        }
      `}</style>

      <Header
        title="Utilisateurs"
        subtitle={`${total} utilisateur${total > 1 ? "s" : ""} inscrits`}
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
          {["", "CITOYEN", "OFFICIER", "ADMIN"].map((r) => (
            <Link
              key={r}
              href={`/admin/users${r ? `?role=${r}` : ""}`}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "2px",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                background:
                  filterRole === r || (!filterRole && r === "")
                    ? "var(--bg-card)"
                    : "var(--ci-green)",
                color:
                  filterRole === r || (!filterRole && r === "")
                    ? "var(--navy)"
                    : "var(--cream)",
                border: "1px solid rgba(201,168,76,0.2)",
                fontWeight: 500,
              }}
            >
              {r || "Tous"}
            </Link>
          ))}
        </div>

        {/* ── TABLE DESKTOP ── */}
        <div
          className="users-table"
          style={{
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: "4px",
            overflow: "visible",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "auto",
              overflow: "visible",
            }}
          >
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "24%" }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {[
                  "Utilisateur",
                  "Email",
                  "Rôle actuel",
                  "Déclarations",
                  "Inscrit le",
                  "Changer le rôle",
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
            <tbody style={{ overflow: "visible" }}>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < users.length - 1
                        ? "1px solid rgba(201,168,76,0.06)"
                        : "none",
                    overflow: "visible",
                  }}
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontWeight: 500,
                      fontSize: "0.88rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "var(--bg-card)",
                    }}
                  >
                    {u.prenom} {u.nom}
                    {u.id === user.id && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          opacity: 0.45,
                          marginLeft: "0.5rem",
                        }}
                      >
                        (moi)
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.8rem",
                      opacity: 0.6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.email}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "0.2rem 0.65rem",
                        borderRadius: "2px",
                        background: roleBg(u.role),
                        color: roleColor(u.role),
                        border: `1px solid ${roleBorder(u.role)}`,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.85rem",
                      textAlign: "center",
                    }}
                  >
                    {u._count.declarations}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.78rem",
                      opacity: 0.45,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(u.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      overflow: "visible",
                      position: "relative",
                    }}
                  >
                    {u.id !== user.id ? (
                      <RoleChanger
                        userId={u.id}
                        currentRole={u.role as "CITOYEN" | "OFFICIER" | "ADMIN"}
                      />
                    ) : (
                      <span style={{ fontSize: "0.72rem", opacity: 0.3 }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── CARDS MOBILE ── */}
        <div className="users-cards">
          {users.map((u) => {
            const av = avatarColor(u.nom);
            return (
              <div
                key={u.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${roleBorder(u.role)}`,
                  borderRadius: "14px",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    height: "4px",
                    background: `linear-gradient(90deg, ${roleColor(u.role)}, transparent)`,
                  }}
                />

                <div
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {/* Ligne 1 — avatar + nom + badge rôle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: av.bg,
                        border: `1.5px solid ${roleBorder(u.role)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: av.text,
                        flexShrink: 0,
                      }}
                    >
                      {initiales(u.prenom, u.nom)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: "white",
                          }}
                        >
                          {u.prenom} {u.nom}
                        </span>
                        {u.id === user.id && (
                          <span
                            style={{
                              fontSize: "0.62rem",
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            (moi)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.4)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "0.15rem",
                        }}
                      >
                        {u.email}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        padding: "0.25rem 0.7rem",
                        borderRadius: "20px",
                        background: roleBg(u.role),
                        color: roleColor(u.role),
                        border: `1px solid ${roleBorder(u.role)}`,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Ligne 2 — stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(247,127,0,0.07)",
                        border: "1px solid rgba(247,127,0,0.15)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.875rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.15rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#f77f00",
                        }}
                      >
                        {u._count.declarations}
                      </span>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        déclaration{u._count.declarations > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div
                      style={{
                        flex: 2,
                        background: "rgba(0,154,68,0.07)",
                        border: "1px solid rgba(0,154,68,0.15)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.875rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.15rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.62rem",
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Inscrit le
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          color: "#b3dfc5",
                        }}
                      >
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Ligne 3 — changer rôle */}
                  {u.id !== user.id && (
                    <div
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.62rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(255,255,255,0.3)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Modifier le rôle
                      </div>
                      <RoleChanger
                        userId={u.id}
                        currentRole={u.role as "CITOYEN" | "OFFICIER" | "ADMIN"}
                        inline={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
      </div>
    </>
  );
}
