export type Role = "CITOYEN" | "OFFICIER" | "ADMIN";

export type StatutDeclaration = "EN_ATTENTE" | "VALIDEE" | "REJETEE";

export type TypeExtrait = "INTEGRALE" | "AVEC_FILIATION" | "SANS_FILIATION";

export interface UserDB {
  id: string;
  clerkId: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  createdAt: Date;
}

export interface DeclarationDB {
  id: string;
  citoyenId: string;
  officierId: string | null;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: Date;
  lieuNaissance: string;
  sexe: "M" | "F";
  nomPere: string;
  prenomPere: string;
  nomMere: string;
  prenomMere: string;
  statut: StatutDeclaration;
  motifRejet: string | null;
  createdAt: Date;
  updatedAt: Date;
  citoyen?: Pick<UserDB, "nom" | "prenom" | "email">;
  officier?: Pick<UserDB, "nom" | "prenom"> | null;
  acte?: ActeDB | null;
  extraits?: ExtraitDB[];
}

export interface ActeDB {
  id: string;
  numero: string;
  declarationId: string;
  dateValidation: Date;
}

export interface ExtraitDB {
  id: string;
  userId: string;
  declarationId: string;
  type: TypeExtrait;
  pdfUrl: string | null;
  createdAt: Date;
  declaration?: DeclarationDB;
  user?: Pick<UserDB, "nom" | "prenom" | "email">;
}

export interface AuditLogDB {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
