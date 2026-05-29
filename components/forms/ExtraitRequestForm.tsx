"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";

interface Props {
  declarationId: string;
  nomEnfant: string;
}

export default function ExtraitRequestForm({
  declarationId,
  nomEnfant,
}: Props) {
  const router = useRouter();
  const [type, setType] = useState("INTEGRALE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [extraitId, setExtraitId] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/extraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationId, type }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erreur lors de la demande");
        return;
      }

      const { extrait } = await res.json();
      setExtraitId(extrait.id);
      setSuccess(true);
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          background: "rgba(0,154,68,0.08)",
          border: "1px solid rgba(0,154,68,0.25)",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        {/* Icône succès */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(0,154,68,0.15)",
            border: "1.5px solid rgba(0,154,68,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "1.1rem",
            color: "#009a44",
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "#b3dfc5",
            marginBottom: "0.5rem",
          }}
        >
          Extrait demandé avec succès
        </div>
        <p
          style={{
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "1.25rem",
            lineHeight: 1.6,
          }}
        >
          Votre extrait pour {nomEnfant} est prêt au téléchargement.
        </p>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          <button
            onClick={() =>
              window.open(`/api/extraits/${extraitId}/pdf`, "_blank")
            }
            style={{
              width: "100%",
              background: "#f77f00",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.65rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ↓ Télécharger le PDF
          </button>
          <button
            onClick={() => router.push("/citoyen/extraits")}
            style={{
              width: "100%",
              background: "transparent",
              color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "0.65rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Voir mes extraits
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      <Select
        label="Type d'extrait"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { value: "INTEGRALE", label: "Copie intégrale" },
          { value: "AVEC_FILIATION", label: "Extrait avec filiation" },
          { value: "SANS_FILIATION", label: "Extrait sans filiation" },
        ]}
      />

      {/* Description du type */}
      <div
        style={{
          background: "rgba(247,127,0,0.06)",
          border: "1px solid rgba(247,127,0,0.15)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.6,
        }}
      >
        {type === "INTEGRALE" &&
          "Reproduit l'intégralité de l'acte de naissance avec toutes les mentions."}
        {type === "AVEC_FILIATION" &&
          "Contient les informations de l'enfant ainsi que celles des parents."}
        {type === "SANS_FILIATION" &&
          "Contient uniquement les informations de l'enfant, sans mention des parents."}
      </div>

      {/* Erreur */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            fontSize: "0.8rem",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      {/* Bouton submit custom pour cohérence visuelle */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "rgba(247,127,0,0.5)" : "#f77f00",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "0.75rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.15s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        {loading && (
          <span
            style={{
              width: "14px",
              height: "14px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
            }}
          />
        )}
        {loading ? "Traitement..." : "Demander cet extrait"}
      </button>
    </form>
  );
}
