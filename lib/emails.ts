// lib/emails.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = "Waya <onboarding@resend.dev>"; // en test, utilise cette adresse

// ── Email : déclaration soumise ───────────────────────────────────────────────
export async function sendDeclarationSoumise({
  email,
  prenom,
  prenomEnfant,
  nomEnfant,
  declarationId,
}: {
  email: string;
  prenom: string;
  prenomEnfant: string;
  nomEnfant: string;
  declarationId: string;
}) {
  const lien = `${APP_URL}/citoyen/declaration/${declarationId}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "✅ Votre déclaration a bien été soumise — waya",
    html: buildEmail({
      title: "Déclaration soumise avec succès",
      color: "#f77f00",
      body: `
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>Votre déclaration de naissance pour <strong>${prenomEnfant} ${nomEnfant}</strong> a bien été enregistrée et est en attente de validation par un officier d'état civil.</p>
        <p>Vous serez notifié par email dès qu'une décision sera prise.</p>
      `,
      btnText: "Suivre ma déclaration",
      btnUrl: lien,
      badge: "EN ATTENTE",
      badgeColor: "#f77f00",
    }),
  });
}

// ── Email : déclaration validée ───────────────────────────────────────────────
export async function sendDeclarationValidee({
  email,
  prenom,
  prenomEnfant,
  nomEnfant,
  numeroActe,
  declarationId,
}: {
  email: string;
  prenom: string;
  prenomEnfant: string;
  nomEnfant: string;
  numeroActe: string;
  declarationId: string;
}) {
  const lien = `${APP_URL}/citoyen/declaration/${declarationId}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "🎉 Déclaration validée — vous pouvez demander votre extrait",
    html: buildEmail({
      title: "Déclaration validée !",
      color: "#009a44",
      body: `
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>Bonne nouvelle ! La déclaration de naissance de <strong>${prenomEnfant} ${nomEnfant}</strong> a été <strong style="color:#009a44">validée</strong> par un officier d'état civil.</p>
        <p>Numéro d'acte attribué : <strong style="font-size:1.1em;color:#009a44">${numeroActe}</strong></p>
        <p>Vous pouvez dès maintenant demander votre extrait de naissance directement depuis votre espace.</p>
      `,
      btnText: "Demander mon extrait",
      btnUrl: lien,
      badge: "VALIDÉE",
      badgeColor: "#009a44",
    }),
  });
}

// ── Email : déclaration rejetée ───────────────────────────────────────────────
export async function sendDeclarationRejetee({
  email,
  prenom,
  prenomEnfant,
  nomEnfant,
  motifRejet,
  declarationId,
}: {
  email: string;
  prenom: string;
  prenomEnfant: string;
  nomEnfant: string;
  motifRejet?: string | null;
  declarationId: string;
}) {
  const lien = `${APP_URL}/citoyen/declaration/${declarationId}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "❌ Déclaration rejetée — waya",
    html: buildEmail({
      title: "Déclaration rejetée",
      color: "#ef4444",
      body: `
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>La déclaration de naissance de <strong>${prenomEnfant} ${nomEnfant}</strong> a été <strong style="color:#ef4444">rejetée</strong> par un officier d'état civil.</p>
        ${
          motifRejet
            ? `
        <div style="background:#fef2f2;border-left:3px solid #ef4444;padding:1rem;border-radius:4px;margin:1rem 0;">
          <p style="margin:0;font-size:0.9em;color:#b91c1c"><strong>Motif :</strong> ${motifRejet}</p>
        </div>
        `
            : ""
        }
        <p>Vous pouvez soumettre une nouvelle déclaration corrigée depuis votre espace.</p>
      `,
      btnText: "Voir ma déclaration",
      btnUrl: lien,
      badge: "REJETÉE",
      badgeColor: "#ef4444",
    }),
  });
}

// ── Template HTML commun ──────────────────────────────────────────────────────
function buildEmail({
  title,
  color,
  body,
  btnText,
  btnUrl,
  badge,
  badgeColor,
}: {
  title: string;
  color: string;
  body: string;
  btnText: string;
  btnUrl: string;
  badge: string;
  badgeColor: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Bandeau tricolore -->
          <tr>
            <td style="padding:0;height:6px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f77f00;height:6px;width:33.33%"></td>
                  <td style="background:#ffffff;height:6px;width:33.33%;border-top:6px solid #e5e5e5"></td>
                  <td style="background:#009a44;height:6px;width:33.33%"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background:#03180b;padding:8px 20px;border-radius:100px;margin-bottom:20px;">
                <span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#f77f00;letter-spacing:0.05em;">wa</span><span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#ffffff;letter-spacing:0.05em;">ya</span>
              </div>
              <div style="display:inline-block;padding:4px 14px;border-radius:100px;background:${badgeColor}18;border:1px solid ${badgeColor}40;color:${badgeColor};font-size:0.7rem;font-weight:600;letter-spacing:0.12em;margin-bottom:16px;">${badge}</div>
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:1.6rem;font-weight:600;color:#0d1117;line-height:1.2;">${title}</h1>
              <div style="width:40px;height:3px;background:linear-gradient(90deg,${color},transparent);margin:12px auto 0;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px;font-size:0.95rem;line-height:1.7;color:#374151;">
              ${body}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${btnUrl}"
                style="display:inline-block;background:${color};color:#ffffff;padding:14px 32px;border-radius:6px;font-size:0.875rem;font-weight:600;text-decoration:none;letter-spacing:0.04em;">
                ${btnText} →
              </a>
              <p style="margin:16px 0 0;font-size:0.75rem;color:#9ca3af;">
                Ou copiez ce lien : <a href="${btnUrl}" style="color:${color};word-break:break-all;">${btnUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:0.75rem;color:#9ca3af;">
                waya — Registre Natal · République de Côte d'Ivoire<br>
                Mémoire L3 — Digitalisation Administrative
              </p>
            </td>
          </tr>

          <!-- Bandeau tricolore bas -->
          <tr>
            <td style="padding:0;height:4px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f77f00;height:4px;width:33.33%"></td>
                  <td style="background:#e5e5e5;height:4px;width:33.33%"></td>
                  <td style="background:#009a44;height:4px;width:33.33%"></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
