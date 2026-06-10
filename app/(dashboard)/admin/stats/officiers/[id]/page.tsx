import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Détail officier — Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

type DeclarationItem = {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  citoyen: { nom: string; prenom: string };
  updatedAt: Date;
  motifRejet?: string | null;
  acte?: { numero: string } | null;
};

function StatBox({
  label,
  value,
  color,
  bg,
  border,
}: {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "0.875rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          fontFamily: "'Fraunces', serif",
          color,
          lineHeight: 1,
          marginBottom: "0.35rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DeclarationTable({
  items,
  showMotif = false,
}: {
  items: DeclarationItem[];
  showMotif?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            opacity: 0.4,
            fontSize: "0.82rem",
          }}
        >
          Aucune déclaration
        </div>
      ) : (
        items.map((d, i) => (
          <div
            key={d.id}
            style={{
              padding: "0.875rem 1rem",
              borderBottom:
                i < items.length - 1
                  ? "1px solid rgba(201,168,76,0.06)"
                  : "none",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: "white",
                  marginBottom: "0.2rem",
                }}
              >
                {d.prenomEnfant} {d.nomEnfant}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: showMotif && d.motifRejet ? "0.4rem" : 0,
                }}
              >
                Demandé par {d.citoyen.prenom} {d.citoyen.nom} ·{" "}
                {formatDate(d.updatedAt)}
              </div>
              {showMotif && d.motifRejet && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#f87171",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: "6px",
                    padding: "0.4rem 0.75rem",
                    marginTop: "0.35rem",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 600, opacity: 0.7 }}>
                    Motif :{" "}
                  </span>
                  {d.motifRejet}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {d.acte && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#009a44",
                    fontFamily: "monospace",
                    fontWeight: 500,
                    marginBottom: "0.2rem",
                  }}
                >
                  {d.acte.numero}
                </div>
              )}
              <Link
                href={`/admin/declarations/${d.id}`}
                style={{
                  fontSize: "0.68rem",
                  color: "#f77f00",
                  textDecoration: "none",
                  opacity: 0.7,
                }}
              >
                Voir →
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default async function AdminOfficierDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect(`/${user.role.toLowerCase()}`);

  const officier = await prisma.user.findUnique({
    where: { id, role: "OFFICIER" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      createdAt: true,
    },
  });

  if (!officier) notFound();

  const declarations = await prisma.declaration.findMany({
    where: { officierId: id },
    include: {
      citoyen: { select: { nom: true, prenom: true } },
      acte: { select: { numero: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const validees = declarations.filter((d) => d.statut === "VALIDEE");
  const rejetees = declarations.filter((d) => d.statut === "REJETEE");
  const enAttente = declarations.filter((d) => d.statut === "EN_ATTENTE");
  const total = validees.length + rejetees.length;
  const taux = total > 0 ? Math.round((validees.length / total) * 100) : 0;

  return (
    <>
      <Header
        title={`${officier.prenom} ${officier.nom}`}
        subtitle={`Officier · ${officier.email}`}
      />

      <div className="db-content animate-fade-up">
        {/* Retour */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/admin/stats/officiers"
            style={{
              fontSize: "0.78rem",
              color: "var(--ci-orange)",
              textDecoration: "none",
              opacity: 0.8,
            }}
          >
            ← Retour à la performance
          </Link>
        </div>

        {/* Stats globales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
          className="officier-stat-grid"
        >
          <StatBox
            label="Total traités"
            value={total}
            color="white"
            bg="rgba(255,255,255,0.03)"
            border="rgba(255,255,255,0.07)"
          />
          <StatBox
            label="Validées"
            value={validees.length}
            color="#4ade80"
            bg="rgba(0,154,68,0.07)"
            border="rgba(0,154,68,0.15)"
          />
          <StatBox
            label="Rejetées"
            value={rejetees.length}
            color="#f87171"
            bg="rgba(239,68,68,0.07)"
            border="rgba(239,68,68,0.15)"
          />
          <StatBox
            label="Taux validation"
            value={`${taux}%`}
            color="#f77f00"
            bg="rgba(247,127,0,0.07)"
            border="rgba(247,127,0,0.15)"
          />
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "0.4rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>Taux de validation</span>
            <span>{taux}%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "100px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${taux}%`,
                background:
                  taux >= 80 ? "#009a44" : taux >= 50 ? "#f77f00" : "#ef4444",
                borderRadius: "100px",
              }}
            />
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Validées */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.875rem",
              }}
            >
              <div
                style={{
                  width: "3px",
                  height: "14px",
                  background: "#009a44",
                  borderRadius: "2px",
                }}
              />
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#4ade80",
                  margin: 0,
                }}
              >
                Déclarations validées ({validees.length})
              </h2>
            </div>
            <DeclarationTable items={validees} />
          </section>

          {/* Rejetées */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.875rem",
              }}
            >
              <div
                style={{
                  width: "3px",
                  height: "14px",
                  background: "#ef4444",
                  borderRadius: "2px",
                }}
              />
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#f87171",
                  margin: 0,
                }}
              >
                Déclarations rejetées ({rejetees.length})
              </h2>
            </div>
            <DeclarationTable items={rejetees} showMotif={true} />
          </section>

          {/* En attente */}
          {enAttente.length > 0 && (
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "0.875rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "14px",
                    background: "#f77f00",
                    borderRadius: "2px",
                  }}
                />
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#f77f00",
                    margin: 0,
                  }}
                >
                  En attente ({enAttente.length})
                </h2>
              </div>
              <DeclarationTable items={enAttente} />
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .officier-stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
