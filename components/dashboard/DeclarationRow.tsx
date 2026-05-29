// components/dashboard/DeclarationRow.tsx
"use client";

import Link from "next/link";

interface DeclarationRowProps {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  acteNumero?: string | null;
  statut: React.ReactNode;
  isLast: boolean;
}

export default function DeclarationRow({
  id,
  prenomEnfant,
  nomEnfant,
  dateNaissance,
  lieuNaissance,
  acteNumero,
  statut,
  isLast,
}: DeclarationRowProps) {
  return (
    <Link
      href={`/citoyen/declaration/${id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem 1.5rem",
          gap: "1rem",
          borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
          transition: "background 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.025)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
      >
        {/* Avatar initiales */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: `hsl(${(prenomEnfant.charCodeAt(0) * 53) % 360}, 40%, 28%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
            border: "1.5px solid rgba(255,255,255,0.1)",
          }}
        >
          {prenomEnfant[0]}
          {nomEnfant[0]}
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "white",
              marginBottom: "0.18rem",
            }}
          >
            {prenomEnfant} {nomEnfant}
          </div>
          <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.35)" }}>
            {dateNaissance} · {lieuNaissance}
          </div>
        </div>

        {/* N° acte */}
        {acteNumero && (
          <div
            style={{
              fontSize: "0.72rem",
              color: "#f97316",
              opacity: 0.75,
              flexShrink: 0,
            }}
          >
            N° {acteNumero}
          </div>
        )}

        {statut}

        <span
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.25)",
            flexShrink: 0,
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
