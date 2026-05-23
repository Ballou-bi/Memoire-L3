"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface DeclarationCardProps {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: Date;
  lieuNaissance: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "REJETEE";
  acteNumero?: string | null;
  nbExtraits: number;
}

export default function DeclarationCard({
  id,
  prenomEnfant,
  nomEnfant,
  dateNaissance,
  lieuNaissance,
  statut,
  acteNumero,
  nbExtraits,
}: DeclarationCardProps) {
  return (
    <Link
      href={`/citoyen/declaration/${id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: "4px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)")
        }
      >
        {/* Icone statut */}
        <div
          style={{
            width: "44px",
            height: "44px",
            flexShrink: 0,
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gold)",
            fontSize: "1.1rem",
          }}
        >
          {statut === "VALIDEE" ? "✓" : statut === "REJETEE" ? "✗" : "○"}
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: "0.95rem",
              marginBottom: "0.25rem",
            }}
          >
            {prenomEnfant} {nomEnfant}
          </div>
          <div style={{ fontSize: "0.78rem", opacity: 0.5 }}>
            Né(e) le {formatDate(dateNaissance)} à {lieuNaissance}
          </div>
        </div>

        {/* N° acte */}
        {acteNumero && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--gold)",
                opacity: 0.6,
                marginBottom: "0.2rem",
              }}
            >
              N° Acte
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 500 }}>
              {acteNumero}
            </div>
          </div>
        )}

        {/* Extraits */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: 0.45,
              marginBottom: "0.2rem",
            }}
          >
            Extraits
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--gold)",
            }}
          >
            {nbExtraits}
          </div>
        </div>

        <StatusBadge statut={statut} />

        <span
          style={{
            color: "var(--gold)",
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
