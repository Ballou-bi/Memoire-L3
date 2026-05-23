import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { Card, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import ValidateActions from "./ValidateActions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Valider une déclaration" };

export default async function OfficierDeclarationPage({ params }: Props) {
  const { id } = await params; //
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || (user.role !== "OFFICIER" && user.role !== "ADMIN"))
    redirect("/citoyen");

  const declaration = await prisma.declaration.findUnique({
    where: { id },
    include: {
      citoyen: { select: { nom: true, prenom: true, email: true } },
      officier: { select: { nom: true, prenom: true } },
      acte: true,
    },
  });

  if (!declaration) notFound();

  const field = (label: string, value: string) => (
    <div>
      <div
        style={{
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--gold)",
          opacity: 0.7,
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.88rem" }}>{value}</div>
    </div>
  );

  return (
    <>
      <Header
        title={`${declaration.prenomEnfant} ${declaration.nomEnfant}`}
        subtitle={`Soumis par ${declaration.citoyen.prenom} ${declaration.citoyen.nom} · ${formatDate(declaration.createdAt)}`}
        actions={<StatusBadge statut={declaration.statut} />}
      />

      <div className="db-content animate-fade-up">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Détails */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <Card style={{ padding: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--gold)",
                  opacity: 0.7,
                  marginBottom: "1.25rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                }}
              >
                Informations de l&apos;enfant
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                {field("Prénom", declaration.prenomEnfant)}
                {field("Nom", declaration.nomEnfant)}
                {field(
                  "Date de naissance",
                  formatDate(declaration.dateNaissance),
                )}
                {field(
                  "Sexe",
                  declaration.sexe === "M" ? "Masculin" : "Féminin",
                )}
                {field("Lieu de naissance", declaration.lieuNaissance)}
              </div>
            </Card>

            <Card style={{ padding: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--gold)",
                  opacity: 0.7,
                  marginBottom: "1.25rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                }}
              >
                Filiation
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                {field(
                  "Père",
                  `${declaration.prenomPere} ${declaration.nomPere}`,
                )}
                {field(
                  "Mère",
                  `${declaration.prenomMere} ${declaration.nomMere}`,
                )}
              </div>
            </Card>

            <Card style={{ padding: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--gold)",
                  opacity: 0.7,
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                }}
              >
                Citoyen déclarant
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                {field(
                  "Nom complet",
                  `${declaration.citoyen.prenom} ${declaration.citoyen.nom}`,
                )}
                {field("Email", declaration.citoyen.email)}
              </div>
            </Card>

            {/* Acte si validée */}
            {declaration.acte && (
              <Card
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "rgba(34,197,94,0.04)",
                  borderColor: "rgba(34,197,94,0.2)",
                }}
              >
                <div style={{ fontSize: "0.78rem" }}>
                  ✓ <strong>Acte n° {declaration.acte.numero}</strong> — validé
                  le {formatDate(declaration.acte.dateValidation)}
                  {declaration.officier &&
                    ` par ${declaration.officier.prenom} ${declaration.officier.nom}`}
                </div>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div>
            <ValidateActions
              declarationId={id}
              statut={declaration.statut}
              motifRejet={declaration.motifRejet}
            />
          </div>
        </div>
      </div>
    </>
  );
}
