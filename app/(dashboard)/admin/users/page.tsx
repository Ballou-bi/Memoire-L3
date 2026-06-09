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
    r === "ADMIN"
      ? "#f87171"
      : r === "OFFICIER"
        ? "var(--gold)"
        : "rgba(248,244,237,0.55)";
  const roleBg = (r: string) =>
    r === "ADMIN"
      ? "rgba(239,68,68,0.1)"
      : r === "OFFICIER"
        ? "rgba(201,168,76,0.1)"
        : "rgba(255,255,255,0.05)";

  return (
    <>
      <style>{`
        .users-table { display: block; }
        .users-cards { display: none; }
        @media (max-width: 900px) {
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
                    : "rgba(255,255,255,0.04)",
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
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < users.length - 1
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
                  <td style={{ padding: "0.875rem 1rem" }}>
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
          {users.map((u) => (
            <div
              key={u.id}
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
              {/* Ligne 1 — nom + badge rôle */}
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
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "2px",
                    background: roleBg(u.role),
                    color: roleColor(u.role),
                    flexShrink: 0,
                  }}
                >
                  {u.role}
                </span>
              </div>

              {/* Ligne 2 — email */}
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.45)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                ✉️ {u.email}
              </div>

              {/* Ligne 3 — déclarations + inscrit le */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.45)",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  📄 {u._count.declarations} déclaration
                  {u._count.declarations > 1 ? "s" : ""}
                </span>
                <span>📅 Inscrit le {formatDate(u.createdAt)}</span>
              </div>

              {/* Ligne 4 — changer rôle */}
              {u.id !== user.id && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "0.6rem",
                    marginTop: "0.2rem",
                  }}
                >
                  <RoleChanger
                    userId={u.id}
                    currentRole={u.role as "CITOYEN" | "OFFICIER" | "ADMIN"}
                  />
                </div>
              )}
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
      </div>
    </>
  );
}
