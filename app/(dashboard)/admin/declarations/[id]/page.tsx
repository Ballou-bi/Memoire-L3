import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import ValidateActions from "@/app/(dashboard)/officier/declaration/[id]/ValidateActions";
import type { Metadata } from "next";
import type { ReactNode } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Déclaration — Admin" };

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div
      style={{
        fontSize: "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: "#f97316",
        opacity: 0.8,
        marginBottom: "0.35rem",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "0.875rem",
        color: "white",
        fontWeight: 400,
      }}
    >
      {value}
    </div>
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div
    style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}
    >
      <div
        style={{
          width: "3px",
          height: "14px",
          background: "#f97316",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.5)",
          fontWeight: 600,
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ padding: "1.25rem 1.5rem" }}>{children}</div>
  </div>
);

export default async function AdminDeclarationDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const declaration = await prisma.declaration.findUnique({
    where: { id },
    include: {
      citoyen: { select: { nom: true, prenom: true, email: true } },
      officier: { select: { nom: true, prenom: true } },
      acte: true,
    },
  });

  if (!declaration) notFound();

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
            gridTemplateColumns: "1fr 340px",
            gap: "1.5rem",
            alignItems: "start",
          }}
          className="detail-grid"
        >
          {/* ── Colonne gauche : détails ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <SectionCard title="Informations de l'enfant">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                <Field label="Prénom" value={declaration.prenomEnfant} />
                <Field label="Nom" value={declaration.nomEnfant} />
                <Field
                  label="Date de naissance"
                  value={formatDate(declaration.dateNaissance)}
                />
                <Field
                  label="Sexe"
                  value={declaration.sexe === "M" ? "Masculin" : "Féminin"}
                />
                <Field
                  label="Lieu de naissance"
                  value={declaration.lieuNaissance}
                />
              </div>
            </SectionCard>

            <SectionCard title="Filiation">
              <div
                style={{
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#009a44",
                  fontWeight: 600,
                  marginBottom: "0.875rem",
                }}
              >
                Père
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Field
                  label="Nom complet"
                  value={`${declaration.prenomPere} ${declaration.nomPere}`}
                />
                <Field
                  label="Profession"
                  value={declaration.professionPere ?? "—"}
                />
                <Field
                  label="Nationalité"
                  value={declaration.nationalitePere ?? "—"}
                />
                <Field
                  label="Domicilié"
                  value={declaration.residencePere ?? "—"}
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: "1.25rem",
                }}
              />

              <div
                style={{
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#009a44",
                  fontWeight: 600,
                  marginBottom: "0.875rem",
                }}
              >
                Mère
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                <Field
                  label="Nom complet"
                  value={`${declaration.prenomMere} ${declaration.nomMere}`}
                />
                <Field
                  label="Profession"
                  value={declaration.professionMere ?? "—"}
                />
                <Field
                  label="Nationalité"
                  value={declaration.nationaliteMere ?? "—"}
                />
                <Field
                  label="Domiciliée"
                  value={declaration.residenceMere ?? "—"}
                />
              </div>
            </SectionCard>

            <SectionCard title="Citoyen déclarant">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                <Field
                  label="Nom complet"
                  value={`${declaration.citoyen.prenom} ${declaration.citoyen.nom}`}
                />
                <Field label="Email" value={declaration.citoyen.email} />
              </div>
            </SectionCard>

            {declaration.acte && (
              <div
                style={{
                  background: "rgba(34,197,94,0.05)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "14px",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#22c55e",
                    }}
                  >
                    Acte n° {declaration.acte.numero}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "0.15rem",
                    }}
                  >
                    Validé le {formatDate(declaration.acte.dateValidation)}
                    {declaration.officier &&
                      ` · par ${declaration.officier.prenom} ${declaration.officier.nom}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne droite : actions ── */}
          <div>
            <ValidateActions
              declarationId={id}
              statut={declaration.statut}
              motifRejet={declaration.motifRejet}
              role="ADMIN"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
