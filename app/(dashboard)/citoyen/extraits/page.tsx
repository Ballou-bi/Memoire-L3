import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate, TYPE_EXTRAIT_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes extraits" };

export default async function CitoyenExtraitsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "CITOYEN") redirect("/citoyen");

  const extraits = await prisma.extrait.findMany({
    where: { userId: user.id },
    include: {
      declaration: {
        select: {
          nomEnfant: true,
          prenomEnfant: true,
          dateNaissance: true,
          acte: { select: { numero: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Mes extraits"
        subtitle={`${extraits.length} extrait${extraits.length > 1 ? "s" : ""} téléchargeable${extraits.length > 1 ? "s" : ""}`}
      />

      <div className="db-content animate-fade-up">
        {extraits.length === 0 ? (
          <EmptyState
            title="Aucun extrait"
            subtitle="Vous pouvez demander un extrait depuis le détail d'une déclaration validée."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {extraits.map((e) => (
              <div
                key={e.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Barre dorée top */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                      "linear-gradient(90deg, var(--gold), transparent)",
                  }}
                />

                {/* Type */}
                <Badge color="gold">
                  {TYPE_EXTRAIT_LABELS[e.type] ?? e.type}
                </Badge>

                {/* Enfant */}
                <div
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                >
                  {e.declaration.prenomEnfant} {e.declaration.nomEnfant}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    opacity: 0.5,
                    marginBottom: "0.5rem",
                  }}
                >
                  Né(e) le {formatDate(e.declaration.dateNaissance)}
                </div>

                {/* N° Acte */}
                {e.declaration.acte && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--gold)",
                      opacity: 0.7,
                      marginBottom: "1rem",
                    }}
                  >
                    N° {e.declaration.acte.numero}
                  </div>
                )}

                {/* Date demande */}
                <div
                  style={{
                    fontSize: "0.72rem",
                    opacity: 0.35,
                    marginBottom: "1.25rem",
                  }}
                >
                  Demandé le {formatDate(e.createdAt)}
                </div>

                {/* Télécharger */}
                <a
                  href={`/api/extraits/${e.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--gold)",
                    color: "var(--navy)",
                    padding: "0.55rem 1rem",
                    borderRadius: "2px",
                    textDecoration: "none",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    justifyContent: "center",
                  }}
                >
                  ↓ Télécharger le PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
