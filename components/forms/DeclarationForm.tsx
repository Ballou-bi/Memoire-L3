"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";

interface FormData {
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  nomPere: string;
  prenomPere: string;
  nomMere: string;
  prenomMere: string;
}

const INITIAL: FormData = {
  prenomEnfant: "",
  nomEnfant: "",
  dateNaissance: "",
  lieuNaissance: "",
  sexe: "M",
  nomPere: "",
  prenomPere: "",
  nomMere: "",
  prenomMere: "",
};

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
} as const;

export default function DeclarationForm() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setData((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!data.prenomEnfant) errs.prenomEnfant = "Obligatoire";
    if (!data.nomEnfant) errs.nomEnfant = "Obligatoire";
    if (!data.dateNaissance) errs.dateNaissance = "Obligatoire";
    if (!data.lieuNaissance) errs.lieuNaissance = "Obligatoire";
    if (!data.nomPere) errs.nomPere = "Obligatoire";
    if (!data.prenomPere) errs.prenomPere = "Obligatoire";
    if (!data.nomMere) errs.nomMere = "Obligatoire";
    if (!data.prenomMere) errs.prenomMere = "Obligatoire";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/declarations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateNaissance: new Date(data.dateNaissance).toISOString(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setApiError(json.error ?? "Une erreur est survenue");
        return;
      }

      const { declaration } = await res.json();
      router.push(`/citoyen/declaration/${declaration.id}`);
    } catch {
      setApiError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle = (t: string) => (
    <div
      style={{
        marginBottom: "1.25rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--gold)",
          opacity: 0.8,
        }}
      >
        {t}
      </span>
    </div>
  );

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
    >
      {/* Enfant */}
      <section>
        {sectionTitle("Informations de l'enfant")}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={fieldStyle}>
            <Input
              label="Prénom"
              value={data.prenomEnfant}
              onChange={set("prenomEnfant")}
              error={errors.prenomEnfant}
              placeholder="Ex : Fatou"
              required
            />
            <Input
              label="Nom de famille"
              value={data.nomEnfant}
              onChange={set("nomEnfant")}
              error={errors.nomEnfant}
              placeholder="Ex : Diallo"
              required
            />
          </div>
          <div style={fieldStyle}>
            <Input
              label="Date de naissance"
              type="date"
              value={data.dateNaissance}
              onChange={set("dateNaissance")}
              error={errors.dateNaissance}
              required
            />
            <Select
              label="Sexe"
              value={data.sexe}
              onChange={set("sexe")}
              options={[
                { value: "M", label: "Masculin" },
                { value: "F", label: "Féminin" },
              ]}
            />
          </div>
          <Input
            label="Lieu de naissance"
            value={data.lieuNaissance}
            onChange={set("lieuNaissance")}
            error={errors.lieuNaissance}
            placeholder="Ex : Abidjan, CHU de Cocody"
            required
          />
        </div>
      </section>

      {/* Père */}
      <section>
        {sectionTitle("Informations du père")}
        <div style={fieldStyle}>
          <Input
            label="Prénom du père"
            value={data.prenomPere}
            onChange={set("prenomPere")}
            error={errors.prenomPere}
            placeholder="Ex : Ibrahim"
            required
          />
          <Input
            label="Nom du père"
            value={data.nomPere}
            onChange={set("nomPere")}
            error={errors.nomPere}
            placeholder="Ex : Diallo"
            required
          />
        </div>
      </section>

      {/* Mère */}
      <section>
        {sectionTitle("Informations de la mère")}
        <div style={fieldStyle}>
          <Input
            label="Prénom de la mère"
            value={data.prenomMere}
            onChange={set("prenomMere")}
            error={errors.prenomMere}
            placeholder="Ex : Aminata"
            required
          />
          <Input
            label="Nom de naissance de la mère"
            value={data.nomMere}
            onChange={set("nomMere")}
            error={errors.nomMere}
            placeholder="Ex : Coulibaly"
            required
          />
        </div>
      </section>

      {/* Erreur API */}
      {apiError && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "4px",
            padding: "0.875rem 1rem",
            fontSize: "0.82rem",
            color: "#f87171",
          }}
        >
          {apiError}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          Soumettre la déclaration
        </Button>
      </div>
    </form>
  );
}
