"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Textarea } from "@/components/ui";

interface Props {
  declarationId: string;
  statut: string;
  motifRejet: string | null;
}

export default function ValidateActions({
  declarationId,
  statut,
  motifRejet,
}: Props) {
  const router = useRouter();
  const [action, setAction] = useState<"VALIDER" | "REJETER" | null>(null);
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (action === "REJETER" && motif.trim().length < 10) {
      setError("Le motif doit contenir au moins 10 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/declarations/${declarationId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, motifRejet: motif || undefined }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erreur");
        return;
      }

      router.refresh();
      router.push("/officier");
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Déclaration déjà traitée
  if (statut !== "EN_ATTENTE") {
    return (
      <Card style={{ padding: "1.5rem" }}>
        <div
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--gold)",
            opacity: 0.7,
            marginBottom: "1rem",
            paddingBottom: "0.75rem",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          Décision rendue
        </div>
        <div style={{ fontSize: "0.82rem", opacity: 0.6, lineHeight: 1.7 }}>
          {statut === "VALIDEE"
            ? "Cette déclaration a été validée. L'acte de naissance a été créé."
            : `Cette déclaration a été rejetée.${motifRejet ? ` Motif : ${motifRejet}` : ""}`}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/officier")}
          >
            ← Retour à la file
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "1.5rem" }}>
      <div
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--gold)",
          opacity: 0.7,
          marginBottom: "1.25rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        Décision de l&#39;officier
      </div>

      {!action ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.6,
              marginBottom: "0.5rem",
              lineHeight: 1.6,
            }}
          >
            Après examen du dossier, choisissez une décision :
          </p>
          <Button
            onClick={() => setAction("VALIDER")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            ✓ Valider la déclaration
          </Button>
          <Button
            variant="danger"
            onClick={() => setAction("REJETER")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            ✗ Rejeter la déclaration
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Récap décision */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              background:
                action === "VALIDER"
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(239,68,68,0.08)",
              border: `1px solid ${action === "VALIDER" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              fontSize: "0.82rem",
              color: action === "VALIDER" ? "#4ade80" : "#f87171",
            }}
          >
            {action === "VALIDER"
              ? "✓ Vous allez valider cette déclaration et créer l'acte de naissance."
              : "✗ Vous allez rejeter cette déclaration."}
          </div>

          {/* Motif rejet */}
          {action === "REJETER" && (
            <Textarea
              label="Motif du rejet"
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                setError("");
              }}
              placeholder="Ex : Informations manquantes, pièces justificatives insuffisantes..."
              error={error}
              rows={4}
            />
          )}

          {error && action === "VALIDER" && (
            <div style={{ fontSize: "0.78rem", color: "#f87171" }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setMotif("");
                setError("");
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={submit}
              loading={loading}
              variant={action === "VALIDER" ? "primary" : "danger"}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
