import { z } from "zod";

export const DeclarationSchema = z.object({
  // ── Enfant ────────────────────────────────────────────────────────────────
  prenomEnfant: z.string().min(1, "Prénom obligatoire").max(100),
  nomEnfant: z.string().min(1, "Nom obligatoire").max(100),
  dateNaissance: z.string().datetime({ message: "Date invalide" }),
  lieuNaissance: z.string().min(1, "Lieu obligatoire").max(200),
  sexe: z.enum(["M", "F"], { message: "Sexe invalide" }),

  // ── Père ──────────────────────────────────────────────────────────────────
  nomPere: z.string().min(1, "Nom du père obligatoire").max(100),
  prenomPere: z.string().min(1, "Prénom du père obligatoire").max(100),
  professionPere: z.string().max(100).optional(),
  nationalitePere: z.string().max(100).optional(),
  residencePere: z.string().max(200).optional(),

  // ── Mère ──────────────────────────────────────────────────────────────────
  nomMere: z.string().min(1, "Nom de la mère obligatoire").max(100),
  prenomMere: z.string().min(1, "Prénom de la mère obligatoire").max(100),
  professionMere: z.string().max(100).optional(),
  nationaliteMere: z.string().max(100).optional(),
  residenceMere: z.string().max(200).optional(),
});

export const ValidateDeclarationSchema = z
  .object({
    action: z.enum(["VALIDER", "REJETER"]),
    motifRejet: z.string().min(10, "Motif trop court").optional(),
  })
  .refine(
    (data) =>
      data.action === "VALIDER" ||
      (data.action === "REJETER" && !!data.motifRejet),
    { message: "Le motif est obligatoire pour un rejet", path: ["motifRejet"] },
  );

export const ExtraitRequestSchema = z.object({
  declarationId: z.string().cuid("ID invalide"),
  type: z.enum(["INTEGRALE", "AVEC_FILIATION", "SANS_FILIATION"]),
});

export const ChangeRoleSchema = z.object({
  role: z.enum(["CITOYEN", "OFFICIER", "ADMIN"]),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  statut: z.enum(["EN_ATTENTE", "VALIDEE", "REJETEE"]).optional(),
  search: z.string().optional(),
});

export type DeclarationInput = z.infer<typeof DeclarationSchema>;
export type ValidateInput = z.infer<typeof ValidateDeclarationSchema>;
export type ExtraitInput = z.infer<typeof ExtraitRequestSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
