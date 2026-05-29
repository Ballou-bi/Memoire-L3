// components/dashboard/QueueRow.tsx
"use client";

import Link from "next/link";

interface QueueRowProps {
  id: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  citoyenPrenom: string;
  citoyenNom: string;
  createdAt: string;
  isLast: boolean;
}

export default function QueueRow({
  id,
  prenomEnfant,
  nomEnfant,
  dateNaissance,
  lieuNaissance,
  citoyenPrenom,
  citoyenNom,
  createdAt,
  isLast,
}: QueueRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1.2fr 1.5fr 1fr 100px",
        padding: "1rem 1.5rem",
        alignItems: "center",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
      }}
      className="queue-row"
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.025)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      {/* Enfant avec avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: `hsl(${(prenomEnfant.charCodeAt(0) * 53) % 360}, 38%, 28%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
            border: "1.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {prenomEnfant[0]}
          {nomEnfant[0]}
        </div>
        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "white" }}>
          {prenomEnfant} {nomEnfant}
        </div>
      </div>

      {/* Date naissance */}
      <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
        {dateNaissance}
      </div>

      {/* Lieu */}
      <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
        {lieuNaissance}
      </div>

      {/* Citoyen */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: `hsl(${(citoyenPrenom.charCodeAt(0) * 71) % 360}, 30%, 32%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {citoyenPrenom[0]}
          {citoyenNom[0]}
        </div>
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
          {citoyenPrenom} {citoyenNom}
        </span>
      </div>

      {/* Date soumission */}
      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
        {createdAt}
      </div>

      {/* Bouton traiter */}
      <Link
        href={`/officier/declaration/${id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          background: "#22c55e",
          color: "#0d1f13",
          padding: "0.4rem 0.875rem",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "0.75rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Traiter →
      </Link>
    </div>
  );
}
