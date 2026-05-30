// components/dashboard/ActeSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  basePath: "/officier" | "/admin";
  placeholder?: string;
}

export default function ActeSearch({
  basePath,
  placeholder = "Rechercher par N° d'acte...",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise depuis l'URL — évite le reset après navigation
  const [query, setQuery] = useState(searchParams.get("acte") ?? "");
  const [loading, setLoading] = useState(false);

  // Sync si l'URL change (ex: retour arrière)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get("acte") ?? "");
    setLoading(false);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    router.push(
      `${basePath}/recherche?acte=${encodeURIComponent(query.trim())}`,
    );
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "0.65rem 1rem 0.65rem 2.5rem",
            color: "white",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#f77f00")}
          onBlur={(e) =>
            (e.target.style.borderColor = "rgba(255,255,255,0.08)")
          }
        />
      </div>
      <button
        type="submit"
        disabled={loading || !query.trim()}
        style={{
          background:
            query.trim() && !loading ? "#f77f00" : "rgba(255,255,255,0.06)",
          color: query.trim() && !loading ? "white" : "rgba(255,255,255,0.3)",
          border: "none",
          borderRadius: "10px",
          padding: "0.65rem 1.25rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: query.trim() && !loading ? "pointer" : "not-allowed",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {loading ? "..." : "Rechercher"}
      </button>
    </form>
  );
}
