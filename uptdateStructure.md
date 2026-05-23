ton-projet/
│
├── app/ ← ZIP ✓ + tes fichiers API existants
│ ├── globals.css ← à créer/copier
│ ├── layout.tsx ← ZIP ✓
│ ├── page.tsx ← ZIP ✓
│ ├── LandingClient.tsx ← ZIP ✓
│ ├── not-found.tsx ← ZIP ✓
│ │
│ ├── (auth)/ ← ZIP ✓
│ │ ├── sign-in/[[...sign-in]]/page.tsx
│ │ └── sign-up/[[...sign-up]]/page.tsx
│ │
│ ├── (dashboard)/ ← ZIP ✓
│ │ ├── layout.tsx
│ │ ├── admin/
│ │ │ ├── page.tsx
│ │ │ ├── AdminQuickCard.tsx ← NOUVEAU
│ │ │ ├── extraits/page.tsx
│ │ │ └── users/
│ │ │ ├── page.tsx
│ │ │ └── RoleChanger.tsx
│ │ ├── citoyen/
│ │ │ ├── page.tsx
│ │ │ ├── extraits/page.tsx
│ │ │ └── declaration/
│ │ │ ├── page.tsx ← CORRIGÉ
│ │ │ ├── DeclarationCard.tsx ← NOUVEAU
│ │ │ ├── new/page.tsx
│ │ │ └── [id]/page.tsx
│ │ └── officier/
│ │ ├── page.tsx
│ │ └── declaration/[id]/
│ │ ├── page.tsx
│ │ └── ValidateActions.tsx
│ │
│ └── api/ ← NE PAS TOUCHER — déjà correct
│ ├── webhooks/clerk/route.ts
│ ├── declarations/
│ │ ├── route.ts
│ │ └── [id]/
│ │ ├── route.ts
│ │ └── validate/route.ts
│ ├── extraits/
│ │ ├── route.ts
│ │ └── [id]/
│ │ ├── route.ts
│ │ └── pdf/route.ts
│ ├── users/
│ │ ├── route.ts
│ │ ├── me/route.ts
│ │ └── [id]/role/route.ts
│ └── stats/route.ts
│
├── components/ ← ZIP ✓
│ ├── ui/index.tsx
│ ├── dashboard/
│ │ ├── Sidebar.tsx
│ │ ├── Header.tsx
│ │ └── StatsCard.tsx
│ └── forms/
│ ├── DeclarationForm.tsx
│ └── ExtraitRequestForm.tsx
│
├── lib/ ← ZIP ✓ sauf pdf.tsx
│ ├── prisma.ts
│ ├── auth.ts
│ ├── utils.ts
│ ├── validations.ts
│ └── pdf.tsx ← NE PAS TOUCHER
│
├── types/ ← ZIP ✓
│ └── index.ts
│
├── prisma/ ← NE PAS TOUCHER
│ ├── schema.prisma
│ └── seed.ts
│
├── proxy.ts ← NE PAS TOUCHER
├── next.config.ts ← NE PAS TOUCHER
├── tsconfig.json ← NE PAS TOUCHER
├── package.json ← NE PAS TOUCHER
└── .env.local ← NE PAS TOUCHER
