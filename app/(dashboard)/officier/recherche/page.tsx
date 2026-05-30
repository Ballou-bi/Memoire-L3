import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import ActeSearch from "@/components/dashboard/ActeSearch";
import RechercheRow from "@/components/dashboard/RechercheRow";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recherche — Officier" };

interface Props {
  searchParams: Promise<{ acte?: string }>;
}

export default async function OfficierRecherchePage({ searchParams }: Props) {
  const { acte } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || (user.role !== "OFFICIER" && user.role !== "ADMIN"))
    redirect("/citoyen");

  const resultats = acte
    ? await prisma.declaration.findMany({
        where: {
          acte: {
            numero: { contains: acte.trim(), mode: "insensitive" },
          },
        },
        include: {
          acte: true,
          citoyen: { select: { nom: true, prenom: true, email: true } },
          officier: { select: { nom: true, prenom: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <>
      <Header
        title="Recherche par acte"
        subtitle="Retrouvez une déclaration via son numéro d'acte"
        actions={
          <Link
            href="/officier"
            style={{
              fontSize: "0.78rem",
              color: "#f77f00",
              textDecoration: "none",
              opacity: 0.75,
            }}
          >
            ← Retour
          </Link>
        }
      />

      <div className="db-content animate-fade-up">
        <div style={{ marginBottom: "1.5rem" }}>
          <ActeSearch
            basePath="/officier"
            placeholder="Ex: ACT-2026-ABC123..."
          />
        </div>

        {acte && (
          <section>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "1rem",
              }}
            >
              {resultats.length} résultat{resultats.length > 1 ? "s" : ""} pour
              «&nbsp;{acte}&nbsp;»
            </p>

            {resultats.length === 0 ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  padding: "3rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.875rem",
                  }}
                >
                  Aucun acte trouvé pour ce numéro.
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                {resultats.map((d, i) => (
                  <RechercheRow
                    key={d.id}
                    id={d.id}
                    href={`/officier/declaration/${d.id}`}
                    prenomEnfant={d.prenomEnfant}
                    nomEnfant={d.nomEnfant}
                    dateNaissance={formatDate(d.dateNaissance)}
                    lieuNaissance={d.lieuNaissance}
                    acteNumero={d.acte?.numero ?? ""}
                    citoyenPrenom={d.citoyen.prenom}
                    citoyenNom={d.citoyen.nom}
                    statut={d.statut}
                    isLast={i === resultats.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!acte && (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <p
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}
            >
              Entrez un numéro d&lsquo;acte pour lancer la recherche.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
