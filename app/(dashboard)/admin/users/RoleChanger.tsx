"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "CITOYEN" | "OFFICIER" | "ADMIN";

interface Props {
  userId: string;
  currentRole: Role;
  inline?: boolean; // true sur mobile cards, false sur desktop table
}

const OPTIONS: {
  value: Role;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "CITOYEN",
    label: "Citoyen",
    color: "#009a44",
    bg: "rgba(0,154,68,0.12)",
    border: "rgba(0,154,68,0.3)",
  },
  {
    value: "OFFICIER",
    label: "Officier",
    color: "#f77f00",
    bg: "rgba(247,127,0,0.12)",
    border: "rgba(247,127,0,0.3)",
  },
  {
    value: "ADMIN",
    label: "Admin",
    color: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
  },
];

export default function RoleChanger({
  userId,
  currentRole,
  inline = false,
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const current = OPTIONS.find((o) => o.value === role)!;

  useEffect(() => {
    if (open && !inline && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 60;
      setOpenUp(spaceBelow < dropdownHeight + 10);
    }
  }, [open, inline]);

  const save = async (newRole: Role) => {
    if (newRole === currentRole) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
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

  const dropdown = (
    <div
      style={{
        background: "#0d1e38",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "10px",
        padding: "0.4rem",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "0.3rem",
        ...(inline
          ? {}
          : {
              position: "absolute",
              ...(openUp
                ? { bottom: "calc(100% + 6px)", top: "auto" }
                : { top: "calc(100% + 6px)", bottom: "auto" }),
              left: 0,
              zIndex: 20,
              minWidth: "130px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }),
        ...(inline ? { marginTop: "0.5rem" } : {}),
      }}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => {
            setRole(o.value);
            setOpen(false);
            save(o.value);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "6px",
            background: role === o.value ? o.bg : "transparent",
            border:
              role === o.value
                ? `1px solid ${o.border}`
                : "1px solid transparent",
            color: o.color,
            fontSize: "0.72rem",
            fontWeight: role === o.value ? 700 : 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            transition: "background 0.15s",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: o.color,
              flexShrink: 0,
            }}
          />
          {o.label}
          {role === o.value && (
            <span style={{ marginLeft: "auto", fontSize: "0.65rem" }}>✓</span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ position: inline ? "static" : "relative", display: "block" }}>
      {/* Pill cliquable */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.28rem 0.75rem",
          borderRadius: "20px",
          background: current.bg,
          color: current.color,
          border: `1px solid ${current.border}`,
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "opacity 0.15s",
          opacity: loading ? 0.5 : 1,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: current.color,
            flexShrink: 0,
          }}
        />
        {loading ? "..." : saved ? "✓ Sauvegardé" : current.label}
        <span
          style={{ fontSize: "0.6rem", opacity: 0.6, marginLeft: "0.1rem" }}
        >
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Dropdown inline (mobile) ou absolu (desktop) */}
      {open && (
        <>
          {!inline && (
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={() => setOpen(false)}
            />
          )}
          {dropdown}
        </>
      )}
    </div>
  );
}
