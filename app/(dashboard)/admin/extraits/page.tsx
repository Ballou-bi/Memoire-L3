import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

  // Redirection selon rôle DB — source de vérité
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const page = parseInt(pageStr ?? "1");
  const limit = 20;
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

  return (
    <>
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
                          fontSize: "0.88rem",
                        }}
                      >
                        {e.declaration.prenomEnfant} {e.declaration.nomEnfant}
                        <div
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.45,
                            marginTop: "0.15rem",
                          }}
                        >
                          Né(e) le {formatDate(e.declaration.dateNaissance)}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.78rem",
                          color: "var(--gold)",
                          opacity: 0.8,
                        }}
                      >
                        {e.declaration.acte?.numero ?? "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <Badge color="gold">
                          {TYPE_EXTRAIT_LABELS[e.type] ?? e.type}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          fontSize: "0.82rem",
                          opacity: 0.65,
                        }}
                      >
                        {e.user.prenom} {e.user.nom}
                        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
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
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <a
                          href={`/api/extraits/${e.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--gold)",
                            textDecoration: "none",
                            opacity: 0.8,
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
                    href={`/admin/extraits?page=${p}`}
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
