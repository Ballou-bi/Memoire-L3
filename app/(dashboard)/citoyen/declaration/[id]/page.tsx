import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { StatusBadge, Card, Badge } from "@/components/ui";
import ExtraitRequestForm from "@/components/forms/ExtraitRequestForm";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d = await prisma.declaration.findUnique({
    where: { id },
    select: { nomEnfant: true, prenomEnfant: true },
  });
  return { title: d ? `${d.prenomEnfant} ${d.nomEnfant}` : "Déclaration" };
}

export default async function DeclarationDetailPage({ params }: Props) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  // Redirection selon rôle DB — source de vérité
  if (user.role === "OFFICIER") redirect("/officier");
  if (user.role === "ADMIN") redirect("/admin");

  const declaration = await prisma.declaration.findUnique({
    where: { id },
    include: {
      officier: { select: { nom: true, prenom: true } },
      acte: true,
      extraits: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!declaration || declaration.citoyenId !== user.id) notFound();

  const field = (label: string, value: string) => (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var( --ci-orange)",
          opacity: 0.7,
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9rem" }}>{value}</div>
    </div>
  );

  return (
    <>
      <Header
        title={`${declaration.prenomEnfant} ${declaration.nomEnfant}`}
        subtitle={`Déclaration soumise le ${formatDate(declaration.createdAt)}`}
        actions={
          <Link
            href="/citoyen/declaration"
            style={{
              fontSize: "0.78rem",
              color: "var( --ci-orange)",
              opacity: 0.6,
              textDecoration: "none",
            }}
          >
            ← Retour
          </Link>
        }
      />

      <div className="db-content animate-fade-up">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "1.5rem",
            alignItems: "start",
            color: "white",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <Card
              style={{
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <StatusBadge statut={declaration.statut} />
              {declaration.statut === "VALIDEE" && declaration.officier && (
                <span style={{ fontSize: "0.78rem", opacity: 0.5 }}>
                  Validée par {declaration.officier.prenom}{" "}
                  {declaration.officier.nom}
                </span>
              )}
              {declaration.statut === "REJETEE" && declaration.motifRejet && (
                <span style={{ fontSize: "0.78rem", color: "#f87171" }}>
                  Motif : {declaration.motifRejet}
                </span>
              )}
              {declaration.acte && (
                <Badge color="orange">N° {declaration.acte.numero}</Badge>
              )}
            </Card>

            <Card style={{ padding: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--bg-card)",
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
                  gap: "0.25rem",
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
                  color: "var(--bg-card)",
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
                  gap: "0.25rem",
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

            {declaration.extraits.length > 0 && (
              <Card style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--bg-card)",
                    opacity: 0.7,
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  Extraits délivrés ({declaration.extraits.length})
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {declaration.extraits.map((e) => (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.82rem" }}>
                          {e.type.replace(/_/g, " ")}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.45,
                            marginLeft: "0.75rem",
                          }}
                        >
                          {formatDate(e.createdAt)}
                        </span>
                      </div>
                      <a
                        href={`/api/extraits/${e.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "0.75rem",
                          color: "var( --ci-orange)",
                          textDecoration: "none",
                        }}
                      >
                        ↓ PDF
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div>
            {declaration.statut === "VALIDEE" ? (
              <Card style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--bg-card)",
                    opacity: 0.7,
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  Demander un extrait
                </div>
                <ExtraitRequestForm
                  declarationId={declaration.id}
                  nomEnfant={`${declaration.prenomEnfant} ${declaration.nomEnfant}`}
                />
              </Card>
            ) : (
              <Card style={{ padding: "1.5rem", textAlign: "center" }}>
                <div
                  style={{ fontSize: "0.8rem", opacity: 0.5, lineHeight: 1.7 }}
                >
                  {declaration.statut === "EN_ATTENTE"
                    ? "La demande d'extrait sera disponible une fois la déclaration validée par un officier."
                    : "Cette déclaration a été rejetée. Un extrait ne peut pas être délivré."}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
