"use client";

import Link from "next/link";

interface AdminQuickCardProps {
  label: string;
  href: string;
  desc: string;
}

export default function AdminQuickCard({
  label,
  href,
  desc,
}: AdminQuickCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: "4px",
          padding: "1.5rem",
          transition: "border-color 0.15s",
          cursor: "pointer",
          height: "100%",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)")
        }
      >
        <div
          style={{
            fontSize: "0.92rem",
            fontWeight: 500,
            marginBottom: "0.4rem",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "0.78rem", opacity: 0.45 }}>{desc}</div>
        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.8rem",
            color: "var(--gold)",
            opacity: 0.7,
          }}
        >
          Accéder →
        </div>
      </div>
    </Link>
  );
}
