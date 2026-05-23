"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui";

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
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "4px",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{ fontSize: "0.9rem", color: "#4ade80", marginBottom: "1rem" }}
        >
          ✓ Extrait demandé avec succès
        </div>
        <p
          style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "1.25rem" }}
        >
          Votre extrait pour {nomEnfant} est prêt au téléchargement.
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <Button
            onClick={() =>
              window.open(`/api/extraits/${extraitId}/pdf`, "_blank")
            }
          >
            Télécharger le PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/citoyen/extraits")}
          >
            Voir mes extraits
          </Button>
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
      <div style={{ fontSize: "0.78rem", opacity: 0.5, lineHeight: 1.6 }}>
        {type === "INTEGRALE" &&
          "Reproduit l'intégralité de l'acte de naissance avec toutes les mentions."}
        {type === "AVEC_FILIATION" &&
          "Contient les informations de l'enfant ainsi que celles des parents."}
        {type === "SANS_FILIATION" &&
          "Contient uniquement les informations de l'enfant, sans mention des parents."}
      </div>
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "4px",
            padding: "0.75rem 1rem",
            fontSize: "0.8rem",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}
      <Button type="submit" loading={loading}>
        Demander cet extrait
      </Button>
    </form>
  );
}
