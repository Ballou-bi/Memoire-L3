// components/dashboard/DeclarationCard.tsx
"use client";

import Link from "next/link";

interface DeclarationCardProps {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  statut: "VALIDEE" | "REJETEE" | "EN_ATTENTE";
  acteNumero?: string | null;
  extraitsCount: number;
  statusBadge: React.ReactNode;
}

export default function DeclarationCard({
  id,
  prenomEnfant,
  nomEnfant,
  dateNaissance,
  lieuNaissance,
  statut,
  acteNumero,
  extraitsCount,
  statusBadge,
}: DeclarationCardProps) {
  const iconColor =
    statut === "VALIDEE"
      ? "#009a44"
      : statut === "REJETEE"
        ? "#ef4444"
        : "#f77f00";

  const icon = statut === "VALIDEE" ? "✓" : statut === "REJETEE" ? "✗" : "○";

  return (
    <Link
      href={`/citoyen/declaration/${id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          transition: "border-color 0.15s, background 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(247,127,0,0.35)";
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.03)";
        }}
      >
        {/* Icône statut */}
        <div
          style={{
            width: "44px",
            height: "44px",
            flexShrink: 0,
            border: `1.5px solid ${iconColor}40`,
            borderRadius: "50%",
            background: `${iconColor}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          {icon}
        </div>

        {/* Infos enfant */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: "0.95rem",
              color: "white",
              marginBottom: "0.25rem",
            }}
          >
            {prenomEnfant} {nomEnfant}
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
            Né(e) le {dateNaissance} à {lieuNaissance}
          </div>
        </div>

        {/* N° acte */}
        {acteNumero && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#f77f00",
                opacity: 0.7,
                marginBottom: "0.2rem",
              }}
            >
              N° Acte
            </div>
            <div
              style={{ fontSize: "0.78rem", fontWeight: 500, color: "white" }}
            >
              {acteNumero}
            </div>
          </div>
        )}

        {/* Extraits */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "0.2rem",
            }}
          >
            Extraits
          </div>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#009a44",
            }}
          >
            {extraitsCount}
          </div>
        </div>

        {statusBadge}

        <span
          style={{
            color: "#f77f00",
            opacity: 0.6,
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
