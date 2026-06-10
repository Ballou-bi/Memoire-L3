"use client";

import Link from "next/link";

interface Props {
  id: string;
  index: number;
  prenom: string;
  nom: string;
  email: string;
  total: number;
  validees: number;
  rejetees: number;
  taux: number;
  derniereAction: { updatedAt: Date } | null;
}

function fmt(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function OfficierCard({
  id,
  index,
  prenom,
  nom,
  email,
  total,
  validees,
  rejetees,
  taux,
  derniereAction,
}: Props) {
  return (
    <Link
      href={`/admin/stats/officiers/${id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: "14px",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(247,127,0,0.3)";
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.035)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(201,168,76,0.1)";
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.02)";
        }}
      >
        {/* Bande couleur selon rang */}
        <div
          style={{
            height: "3px",
            background:
              index === 0
                ? "linear-gradient(90deg, #f77f00, transparent)"
                : index === 1
                  ? "linear-gradient(90deg, #009a44, transparent)"
                  : "linear-gradient(90deg, rgba(201,168,76,0.5), transparent)",
          }}
        />

        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Ligne 1 — identité + rang */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background:
                    index === 0
                      ? "rgba(247,127,0,0.15)"
                      : "rgba(0,154,68,0.12)",
                  border: `1.5px solid ${index === 0 ? "rgba(247,127,0,0.35)" : "rgba(0,154,68,0.25)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: index === 0 ? "#f77f00" : "#009a44",
                  flexShrink: 0,
                }}
              >
                {prenom?.[0] ?? ""}
                {nom?.[0] ?? ""}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "white",
                  }}
                >
                  {prenom} {nom}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: "0.1rem",
                  }}
                >
                  {email}
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  background:
                    index === 0
                      ? "rgba(247,127,0,0.15)"
                      : index === 1
                        ? "rgba(0,154,68,0.12)"
                        : "rgba(255,255,255,0.05)",
                  color:
                    index === 0
                      ? "#f77f00"
                      : index === 1
                        ? "#009a44"
                        : "rgba(255,255,255,0.4)",
                  border: `1px solid ${index === 0 ? "rgba(247,127,0,0.3)" : index === 1 ? "rgba(0,154,68,0.25)" : "rgba(255,255,255,0.08)"}`,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                #{index + 1}
              </span>
              <span
                style={{ fontSize: "0.75rem", color: "#f77f00", opacity: 0.6 }}
              >
                →
              </span>
            </div>
          </div>

          {/* Stats en grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
            className="officier-stat-grid"
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
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
                  color: "white",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}
              >
                {total}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Total traités
              </div>
            </div>

            <div
              style={{
                background: "rgba(0,154,68,0.07)",
                border: "1px solid rgba(0,154,68,0.15)",
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
                  color: "#4ade80",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}
              >
                {validees}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(74,222,128,0.5)",
                }}
              >
                Validées
              </div>
            </div>

            <div
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.15)",
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
                  color: "#f87171",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}
              >
                {rejetees}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(248,113,113,0.5)",
                }}
              >
                Rejetées
              </div>
            </div>

            <div
              style={{
                background: "rgba(247,127,0,0.07)",
                border: "1px solid rgba(247,127,0,0.15)",
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
                  color: "#f77f00",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}
              >
                {taux}%
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(247,127,0,0.5)",
                }}
              >
                Taux validation
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div>
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
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>

          {/* Dernière action */}
          {derniereAction && (
            <div
              style={{
                marginTop: "0.875rem",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Dernière action : {fmt(derniereAction.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
