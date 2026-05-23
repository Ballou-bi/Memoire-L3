"use client";

import type { StatutDeclaration, TypeExtrait, Role } from "@/types";

interface BadgeProps {
  variant?: "statut" | "type" | "role" | "custom";
  statut?: StatutDeclaration;
  type?: TypeExtrait;
  role?: Role;
  label?: string;
  color?: "gold" | "green" | "red" | "blue" | "gray";
}

const STATUT_CONFIG: Record<
  StatutDeclaration,
  { label: string; color: string; dot: string }
> = {
  EN_ATTENTE: {
    label: "En attente",
    color: "rgba(251,191,36,0.12)",
    dot: "#fbbf24",
  },
  VALIDEE: { label: "Validée", color: "rgba(74,222,128,0.12)", dot: "#4ade80" },
  REJETEE: {
    label: "Rejetée",
    color: "rgba(248,113,113,0.12)",
    dot: "#f87171",
  },
};

const TYPE_CONFIG: Record<TypeExtrait, string> = {
  INTEGRALE: "Copie intégrale",
  AVEC_FILIATION: "Avec filiation",
  SANS_FILIATION: "Sans filiation",
};

const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
  CITOYEN: { label: "Citoyen", color: "rgba(201,168,76,0.12)" },
  OFFICIER: { label: "Officier", color: "rgba(99,179,237,0.12)" },
  ADMIN: { label: "Administrateur", color: "rgba(167,139,250,0.12)" },
};

export default function Badge({
  variant = "custom",
  statut,
  type,
  role,
  label,
  color = "gold",
}: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "100px",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  };

  if (variant === "statut" && statut) {
    const cfg = STATUT_CONFIG[statut];
    return (
      <span
        style={{
          ...baseStyle,
          background: cfg.color,
          color: cfg.dot,
          border: `1px solid ${cfg.dot}30`,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
          }}
        />
        {cfg.label}
      </span>
    );
  }

  if (variant === "type" && type) {
    return (
      <span
        style={{
          ...baseStyle,
          background: "rgba(201,168,76,0.1)",
          color: "var(--gold)",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
      >
        {TYPE_CONFIG[type]}
      </span>
    );
  }

  if (variant === "role" && role) {
    const cfg = ROLE_CONFIG[role];
    return (
      <span
        style={{
          ...baseStyle,
          background: cfg.color,
          color: "var(--cream)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {cfg.label}
      </span>
    );
  }

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      gold: {
        bg: "rgba(201,168,76,0.12)",
        text: "var(--gold)",
        border: "rgba(201,168,76,0.25)",
      },
      green: {
        bg: "rgba(74,222,128,0.12)",
        text: "#4ade80",
        border: "rgba(74,222,128,0.25)",
      },
      red: {
        bg: "rgba(248,113,113,0.12)",
        text: "#f87171",
        border: "rgba(248,113,113,0.25)",
      },
      blue: {
        bg: "rgba(99,179,237,0.12)",
        text: "#63b3ed",
        border: "rgba(99,179,237,0.25)",
      },
      gray: {
        bg: "rgba(255,255,255,0.06)",
        text: "var(--cream-dim)",
        border: "rgba(255,255,255,0.1)",
      },
    };

  const c = colorMap[color];
  return (
    <span
      style={{
        ...baseStyle,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}
