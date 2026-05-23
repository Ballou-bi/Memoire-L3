// Wrapper pour gérer les erreurs dans les route handlers
// Évite les try/catch répétitifs dans chaque route
export async function withErrorHandler(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (err) {
    // Si c'est une Response lancée par requireAuth/requireRole
    if (err instanceof Response) return err;

    console.error("[API Error]", err);
    return Response.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

// Formater une date en français
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Labels lisibles pour les statuts
export const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
};

export const TYPE_EXTRAIT_LABELS: Record<string, string> = {
  INTEGRALE: "Copie intégrale",
  AVEC_FILIATION: "Avec filiation",
  SANS_FILIATION: "Sans filiation",
};

export const ROLE_LABELS: Record<string, string> = {
  CITOYEN: "Citoyen",
  OFFICIER: "Officier d'état civil",
  ADMIN: "Administrateur",
};
