# waya — Structure complète Next.js 16

```
registre-natal/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── app/                                      ← App Router (PAS de dossier src/)
│   │
│   ├── layout.tsx                            ← Root layout + ClerkProvider
│   ├── page.tsx                              ← Landing (server — détecte auth → redirige)
│   ├── LandingClient.tsx                     ← Landing (client — ton design)
│   ├── not-found.tsx                         ← Page 404
│   ├── globals.css
│   │
│   ├── (auth)/                               ← Groupe sans layout partagé
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   │
│   ├── (dashboard)/                          ← Routes protégées
│   │   ├── layout.tsx                        ← Vérifie auth + charge Sidebar
│   │   │
│   │   ├── citoyen/
│   │   │   ├── page.tsx                      ← Dashboard citoyen
│   │   │   ├── declaration/
│   │   │   │   ├── page.tsx                  ← Liste des déclarations
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx              ← Formulaire nouvelle déclaration
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              ← Détail déclaration + demande extrait
│   │   │   └── extraits/
│   │   │       └── page.tsx                  ← Mes extraits PDF
│   │   │
│   │   ├── officier/
│   │   │   ├── page.tsx                      ← Dashboard officier (file d'attente)
│   │   │   └── declaration/
│   │   │       └── [id]/
│   │   │           ├── page.tsx              ← Détail + boutons valider/rejeter
│   │   │           └── ValidateActions.tsx   ← Composant client boutons (NO SSR)
│   │   │
│   │   └── admin/
│   │       ├── page.tsx                      ← Dashboard admin (stats globales)
│   │       ├── users/
│   │       │   ├── page.tsx                  ← Gestion utilisateurs + rôles
│   │       │   └── RoleChanger.tsx           ← Composant client changement rôle
│   │       └── extraits/
│   │           └── page.tsx                  ← Historique tous les extraits
│   │
│   └── api/
│       ├── webhooks/
│       │   └── clerk/
│       │       └── route.ts                  ← Sync Clerk → DB (user.created/updated/deleted)
│       │
│       ├── declarations/
│       │   ├── route.ts                      ← GET (liste filtrée par rôle) · POST (créer)
│       │   └── [id]/
│       │       ├── route.ts                  ← GET (détail) · DELETE (annuler)
│       │       └── validate/
│       │           └── route.ts              ← POST (valider ou rejeter — officier/admin)
│       │
│       ├── extraits/
│       │   ├── route.ts                      ← GET (liste) · POST (demander un extrait)
│       │   └── [id]/
│       │       ├── route.ts                  ← GET (détail)
│       │       └── pdf/
│       │           └── route.ts              ← GET (génère et stream le PDF certifié)
│       │
│       ├── users/
│       │   ├── route.ts                      ← GET (liste users — admin seulement)
│       │   ├── me/
│       │   │   └── route.ts                  ← GET (profil utilisateur connecté)
│       │   └── [id]/
│       │       └── role/
│       │           └── route.ts              ← PATCH (changer rôle — admin seulement)
│       │
│       └── stats/
│           └── route.ts                      ← GET (statistiques — officier + admin)
│
├── components/
│   ├── ui/
│   │   └── index.tsx                         ← Button, Badge, StatusBadge, Card,
│   │                                            Input, Select, Textarea,
│   │                                            EmptyState, Spinner
│   ├── dashboard/
│   │   ├── Sidebar.tsx                       ← Navigation latérale (nav par rôle)
│   │   ├── Header.tsx                        ← En-tête de page avec titre + actions
│   │   └── StatsCard.tsx                     ← Carte statistique réutilisable
│   └── forms/
│       ├── DeclarationForm.tsx               ← Formulaire déclaration naissance (client)
│       └── ExtraitRequestForm.tsx            ← Formulaire demande extrait (client)
│
├── lib/
│   ├── prisma.ts                             ← Client Prisma singleton
│   ├── auth.ts                               ← requireAuth(), requireRole(), generateNumeroActe()
│   ├── pdf.ts                                ← Génération PDF + QR Code (@react-pdf/renderer)
│   ├── validations.ts                        ← Schémas Zod (Declaration, Validate, Extrait...)
│   └── utils.ts                              ← withErrorHandler(), formatDate(), labels
│
├── types/
│   └── index.ts                              ← Types TypeScript globaux (Role, StatutDeclaration...)
│
├── proxy.ts                                  ← Next.js 16 — remplace middleware.ts
│                                               Protège les routes par rôle (Clerk)
│                                               export function proxy() { ... }
│
├── .env.local                                ← Variables d'env (ne pas committer)
├── .env.example                              ← Template variables d'env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Résumé des changements vs Next.js 15

| Élément           | Next.js 15                     | Next.js 16 (ce projet)    |
| ----------------- | ------------------------------ | ------------------------- |
| Fichier proxy     | `middleware.ts`                | `proxy.ts`                |
| Fonction exportée | `export function middleware()` | `export function proxy()` |
| Dossier source    | `src/app/`                     | `app/` (pas de src/)      |
| Cache fetch       | no-store défaut                | no-store défaut           |
| params pages      | `Promise<>`                    | `Promise<>` (inchangé)    |
| Runtime proxy     | Edge                           | **Node.js** (nouveau)     |

---

## Contenu de proxy.ts

```ts
// proxy.ts  ←  à la racine du projet (même niveau que app/)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "./types";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isOfficierRoute = createRouteMatcher(["/officier(.*)"]);
const isCitoyenRoute = createRouteMatcher(["/citoyen(.*)"]);

// ← Next.js 16 : export function proxy() au lieu de middleware()
export function proxy(request: NextRequest) {
  return clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return NextResponse.next();

    const { userId, sessionClaims } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const role =
      (sessionClaims?.metadata as { role?: Role })?.role ?? "CITOYEN";

    if (isAdminRoute(req) && role !== "ADMIN")
      return NextResponse.redirect(new URL(roleRedirect(role), req.url));
    if (isOfficierRoute(req) && role !== "OFFICIER" && role !== "ADMIN")
      return NextResponse.redirect(new URL(roleRedirect(role), req.url));
    if (isCitoyenRoute(req) && (role === "OFFICIER" || role === "ADMIN"))
      return NextResponse.redirect(new URL(roleRedirect(role), req.url));

    return NextResponse.next();
  })(request);
}

function roleRedirect(role: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "OFFICIER") return "/officier";
  return "/citoyen";
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

## Import à corriger dans tous les fichiers

Puisqu'il n'y a pas de `src/`, tous les alias `@/` pointent directement vers la racine :

```ts
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]   // ← pas de src/ devant
    }
  }
}
```

```ts
// Imports dans les fichiers
import { prisma } from "@/lib/prisma"; // ✓ → lib/prisma.ts
import { Button } from "@/components/ui"; // ✓ → components/ui/index.tsx
import type { Role } from "@/types"; // ✓ → types/index.ts
```

---

## Arborescence des fichiers par catégorie

### Pages (18 fichiers .tsx)

```
app/layout.tsx
app/page.tsx
app/LandingClient.tsx
app/not-found.tsx
app/(auth)/sign-in/[[...sign-in]]/page.tsx
app/(auth)/sign-up/[[...sign-up]]/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/citoyen/page.tsx
app/(dashboard)/citoyen/declaration/page.tsx
app/(dashboard)/citoyen/declaration/new/page.tsx
app/(dashboard)/citoyen/declaration/[id]/page.tsx
app/(dashboard)/citoyen/extraits/page.tsx
app/(dashboard)/officier/page.tsx
app/(dashboard)/officier/declaration/[id]/page.tsx
app/(dashboard)/officier/declaration/[id]/ValidateActions.tsx
app/(dashboard)/admin/page.tsx
app/(dashboard)/admin/users/page.tsx
app/(dashboard)/admin/users/RoleChanger.tsx
app/(dashboard)/admin/extraits/page.tsx
```

### API Routes (11 fichiers route.ts)

```
app/api/webhooks/clerk/route.ts
app/api/declarations/route.ts
app/api/declarations/[id]/route.ts
app/api/declarations/[id]/validate/route.ts
app/api/extraits/route.ts
app/api/extraits/[id]/route.ts
app/api/extraits/[id]/pdf/route.ts
app/api/users/route.ts
app/api/users/me/route.ts
app/api/users/[id]/role/route.ts
app/api/stats/route.ts
```

### Composants (8 fichiers)

```
components/ui/index.tsx
components/dashboard/Sidebar.tsx
components/dashboard/Header.tsx
components/dashboard/StatsCard.tsx
components/forms/DeclarationForm.tsx
components/forms/ExtraitRequestForm.tsx
```

### Config & lib (8 fichiers)

```
proxy.ts                ← Next.js 16
lib/prisma.ts
lib/auth.ts
lib/pdf.ts
lib/validations.ts
lib/utils.ts
types/index.ts
prisma/schema.prisma
prisma/seed.ts
```

:root {
--navy: #0a1628;
--gold: #c9a84c;
--gold-light: #e8d5a3;
--cream: #f8f4ed;
--accent: #1a3a5c;
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
--sidebar-width: 260px;
}
