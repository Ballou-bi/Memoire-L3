"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "CITOYEN" | "OFFICIER" | "ADMIN";

interface Props {
  userId: string;
  currentRole: Role;
}

const OPTIONS: { value: Role; label: string }[] = [
  { value: "CITOYEN", label: "Citoyen" },
  { value: "OFFICIER", label: "Officier" },
  { value: "ADMIN", label: "Admin" },
];

export default function RoleChanger({ userId, currentRole }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (role === currentRole) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={loading}
        style={{
          background: "#0d1e38",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "2px",
          padding: "0.3rem 0.6rem",
          color: "var(--cream)",
          fontSize: "0.75rem",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {role !== currentRole && (
        <button
          onClick={save}
          disabled={loading}
          style={{
            background: loading ? "rgba(247,127,0,0.3)" : "#f77f00",
            color: "white",
            border: "none",
            borderRadius: "2px",
            padding: "0.3rem 0.75rem",
            fontSize: "0.72rem",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {loading ? "..." : "OK"}
        </button>
      )}

      {saved && (
        <span style={{ fontSize: "0.72rem", color: "#009a44" }}>✓</span>
      )}
    </div>
  );
}
