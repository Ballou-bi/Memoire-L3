import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { StatusBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Toutes les déclarations — Admin" };

interface Props {
  searchParams: Promise<{ statut?: string; search?: string; page?: string }>;
}

export default async function AdminDeclarationsPage({ searchParams }: Props) {
  const { statut: filterStatut, search, page: pageStr } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

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
  if (search) {
    where.OR = [
      { nomEnfant: { contains: search, mode: "insensitive" } },
      { prenomEnfant: { contains: search, mode: "insensitive" } },
      { lieuNaissance: { contains: search, mode: "insensitive" } },
    ];
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

  const FILTRES = [
    { label: "Toutes", value: "" },
    { label: "En attente", value: "EN_ATTENTE" },
    { label: "Validées", value: "VALIDEE" },
    { label: "Rejetées", value: "REJETEE" },
  ];

  return (
    <>
      <Header
        title="Toutes les déclarations"
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
            <a
              key={f.value}
              href={`/admin/declarations${f.value ? `?statut=${f.value}` : ""}`}
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
                    ? "var(--gold)"
                    : "rgba(255,255,255,0.04)",
                color:
                  filterStatut === f.value || (!filterStatut && f.value === "")
                    ? "var(--navy)"
                    : "var(--cream)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {f.label}
            </a>
          ))}
        </div>

        {declarations.length === 0 ? (
          <EmptyState
            title="Aucune déclaration"
            subtitle="Aucune déclaration ne correspond à ce filtre."
          />
        ) : (
          <>
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
                      "Enfant",
                      "Date naiss.",
                      "Lieu",
                      "Citoyen",
                      "Officier",
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
                          fontSize: "0.88rem",
                          whiteSpace: "nowrap",
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
                        }}
                      >
                        {formatDate(d.dateNaissance)}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.8rem",
                          opacity: 0.65,
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
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
                        }}
                      >
                        {d.citoyen.prenom} {d.citoyen.nom}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.78rem",
                          opacity: 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.officier
                          ? `${d.officier.prenom} ${d.officier.nom}`
                          : "—"}
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
                          href={`/officier/declaration/${d.id}`}
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--gold)",
                            textDecoration: "none",
                            opacity: 0.8,
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
                    href={`/admin/declarations?page=${p}${filterStatut ? `&statut=${filterStatut}` : ""}`}
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
          </>
        )}
      </div>
    </>
  );
}
