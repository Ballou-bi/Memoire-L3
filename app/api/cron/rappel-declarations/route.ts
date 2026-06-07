import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Vercel Cron — appelé automatiquement toutes les heures
// Ajoute dans vercel.json : { "crons": [{ "path": "/api/cron/rappel-declarations", "schedule": "0 * * * *" }] }
export async function GET(req: Request) {
  // Sécurité — vérifie que c'est Vercel qui appelle
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const maintenant = new Date();
  const il_y_a_48h = new Date(maintenant.getTime() - 48 * 60 * 60 * 1000);
  const il_y_a_72h = new Date(maintenant.getTime() - 72 * 60 * 60 * 1000);

  // Déclarations en attente depuis + de 48h (urgentes)
  const declarationsUrgentes = await prisma.declaration.findMany({
    where: {
      statut: "EN_ATTENTE",
      createdAt: { lte: il_y_a_48h, gte: il_y_a_72h },
    },
    include: {
      citoyen: { select: { nom: true, prenom: true } },
    },
  });

  // Déclarations en attente depuis + de 72h (deadline dépassée)
  const declarationsEnRetard = await prisma.declaration.findMany({
    where: {
      statut: "EN_ATTENTE",
      createdAt: { lte: il_y_a_72h },
    },
    include: {
      citoyen: { select: { nom: true, prenom: true } },
    },
  });

  if (declarationsUrgentes.length === 0 && declarationsEnRetard.length === 0) {
    return Response.json({ message: "Aucune déclaration urgente" });
  }

  // Récupérer tous les officiers et admins
  const destinataires = await prisma.user.findMany({
    where: { role: { in: ["OFFICIER", "ADMIN"] } },
    select: { email: true, prenom: true, nom: true },
  });

  // Envoyer un email à chaque officier/admin
  for (const dest of destinataires) {
    await resend.emails.send({
      from: "waya <onboarding@resend.dev>",
      to: dest.email,
      subject: `⚠️ ${declarationsUrgentes.length + declarationsEnRetard.length} déclaration(s) nécessitent votre attention`,
      html: buildRappelEmail({
        prenom: dest.prenom,
        urgentes: declarationsUrgentes,
        enRetard: declarationsEnRetard,
        lienDashboard: `${APP_URL}/officier`,
      }),
    });
  }

  // Log audit
  await prisma.auditLog
    .create({
      data: {
        userId: destinataires[0]?.email ?? "system",
        action: "RAPPEL_DECLARATIONS_ENVOYE",
        details: {
          urgentes: declarationsUrgentes.length,
          enRetard: declarationsEnRetard.length,
          destinataires: destinataires.length,
        },
      },
    })
    .catch(() => {}); // silencieux si userId invalide

  return Response.json({
    envoye: destinataires.length,
    urgentes: declarationsUrgentes.length,
    enRetard: declarationsEnRetard.length,
  });
}

function buildRappelEmail({
  prenom,
  urgentes,
  enRetard,
  lienDashboard,
}: {
  prenom: string;
  urgentes: {
    id: string;
    prenomEnfant: string;
    nomEnfant: string;
    createdAt: Date;
    citoyen: { nom: string; prenom: string };
  }[];
  enRetard: {
    id: string;
    prenomEnfant: string;
    nomEnfant: string;
    createdAt: Date;
    citoyen: { nom: string; prenom: string };
  }[];
  lienDashboard: string;
}) {
  const heures = (d: Date) => Math.round((Date.now() - d.getTime()) / 3600000);

  const lignes = (items: typeof urgentes, couleur: string) =>
    items
      .map(
        (d) => `
      <tr>
        <td style="padding:8px 12px;font-size:0.85rem;color:#1a1a1a">${d.prenomEnfant} ${d.nomEnfant}</td>
        <td style="padding:8px 12px;font-size:0.85rem;color:#6b7280">${d.citoyen.prenom} ${d.citoyen.nom}</td>
        <td style="padding:8px 12px;font-size:0.85rem;font-weight:600;color:${couleur}">${heures(d.createdAt)}h écoulées</td>
      </tr>
    `,
      )
      .join("");

  return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Bandeau tricolore -->
        <tr><td style="padding:0;height:6px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#f77f00;height:6px;width:33%"></td>
            <td style="background:#e5e5e5;height:6px;width:33%"></td>
            <td style="background:#009a44;height:6px;width:33%"></td>
          </tr></table>
        </td></tr>

        <!-- Header -->
        <tr><td style="padding:32px 40px 0;text-align:center;">
          <div style="display:inline-block;background:#03180b;padding:8px 20px;border-radius:100px;margin-bottom:16px;">
            <span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#f77f00;">wa</span><span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#fff;">ya</span>
          </div>
          <div style="background:#fff3cd;border:1px solid #f77f00;border-radius:8px;padding:12px 20px;margin-bottom:8px;">
            <span style="font-size:1.5rem;">⚠️</span>
            <h1 style="margin:8px 0 0;font-size:1.3rem;color:#92400e;">Déclarations en attente</h1>
          </div>
          <p style="color:#6b7280;font-size:0.9rem;">Bonjour <strong>${prenom}</strong>, des déclarations nécessitent votre traitement urgent.</p>
        </td></tr>

        <!-- Corps -->
        <tr><td style="padding:24px 40px;">

          ${
            enRetard.length > 0
              ? `
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 12px;font-weight:600;color:#dc2626;font-size:0.9rem;">
              🔴 ${enRetard.length} déclaration(s) — DEADLINE DÉPASSÉE (+72h)
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:6px;overflow:hidden;">
              <thead><tr style="background:#fca5a5;">
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#7f1d1d">Enfant</th>
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#7f1d1d">Citoyen</th>
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#7f1d1d">Délai</th>
              </tr></thead>
              <tbody>${lignes(enRetard, "#dc2626")}</tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            urgentes.length > 0
              ? `
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 12px;font-weight:600;color:#d97706;font-size:0.9rem;">
              🟡 ${urgentes.length} déclaration(s) — À traiter avant 72h
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:6px;overflow:hidden;">
              <thead><tr style="background:#fde68a;">
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#78350f">Enfant</th>
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#78350f">Citoyen</th>
                <th style="padding:8px 12px;text-align:left;font-size:0.75rem;color:#78350f">Délai</th>
              </tr></thead>
              <tbody>${lignes(urgentes, "#d97706")}</tbody>
            </table>
          </div>
          `
              : ""
          }

        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="${lienDashboard}" style="display:inline-block;background:#f77f00;color:#fff;padding:14px 32px;border-radius:6px;font-size:0.875rem;font-weight:600;text-decoration:none;">
            Traiter les déclarations →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;font-size:0.75rem;color:#9ca3af;">
            waya — Registre Natal · République de Côte d'Ivoire<br>
            Ce rappel est automatique — deadline légale de 72h
          </p>
        </td></tr>

        <!-- Bandeau bas -->
        <tr><td style="padding:0;height:4px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#f77f00;height:4px;width:33%"></td>
            <td style="background:#e5e5e5;height:4px;width:33%"></td>
            <td style="background:#009a44;height:4px;width:33%"></td>
          </tr></table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
