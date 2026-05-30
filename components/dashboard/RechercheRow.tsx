// components/dashboard/RechercheRow.tsx
"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";

interface Props {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  acteNumero: string;
  citoyenPrenom: string;
  citoyenNom: string;
  officierPrenom?: string | null;
  officierNom?: string | null;
  statut: "EN_ATTENTE" | "VALIDEE" | "REJETEE";
  isLast: boolean;
  href: string;
}

export default function RechercheRow({
  id,
  prenomEnfant,
  nomEnfant,
  dateNaissance,
  lieuNaissance,
  acteNumero,
  citoyenPrenom,
  citoyenNom,
  officierPrenom,
  officierNom,
  statut,
  isLast,
  href,
}: Props) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
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
        {/* Avatar */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: `hsl(${(prenomEnfant.charCodeAt(0) * 53) % 360}, 38%, 28%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {prenomEnfant[0]}
          {nomEnfant[0]}
        </div>

        {/* Infos enfant */}
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
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#009a44",
            flexShrink: 0,
          }}
        >
          N° {acteNumero}
        </div>

        {/* Citoyen */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.35)",
            flexShrink: 0,
          }}
        >
          {citoyenPrenom} {citoyenNom}
        </div>

        {/* Officier (admin seulement) */}
        {officierPrenom && (
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.25)",
              flexShrink: 0,
            }}
          >
            Officier : {officierPrenom} {officierNom}
          </div>
        )}

        <StatusBadge statut={statut} />
        <span style={{ color: "#f77f00", opacity: 0.6, flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}
