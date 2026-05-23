import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

  // Redirection selon rôle DB — source de vérité
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const page = parseInt(pageStr ?? "1");
  const limit = 20;
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
            <a
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
                    ? "var(--gold)"
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
            </a>
          ))}
        </div>

        {/* Table */}
        <div
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
                      color: "var(--gold)",
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
                      maxWidth: "200px",
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

        {/* Pagination */}
        {total > limit && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              marginTop: "1.5rem",
            }}
          >
            {Array.from(
              { length: Math.ceil(total / limit) },
              (_, i) => i + 1,
            ).map((p) => (
              <a
                key={p}
                href={`/admin/users?page=${p}${filterRole ? `&role=${filterRole}` : ""}`}
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
                    p === page ? "var(--gold)" : "rgba(255,255,255,0.04)",
                  color: p === page ? "var(--navy)" : "var(--cream)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
