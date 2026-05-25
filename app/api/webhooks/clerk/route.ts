import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: "CLERK_WEBHOOK_SECRET manquant" },
      { status: 500 },
    );
  }

  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: "Headers svix manquants" }, { status: 400 });
  }

  const payload = await req.json();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Webhook] Signature invalide:", err);
    return Response.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (evt.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address ?? "",
          nom: last_name ?? "",
          prenom: first_name ?? "",
          role: "CITOYEN",
        },
      });
      console.log(`[Webhook] Utilisateur créé: ${id}`);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address ?? "",
          nom: last_name ?? "",
          prenom: first_name ?? "",
        },
      });
      break;
    }

    case "user.deleted": {
      const { id } = evt.data;
      if (id) {
        await prisma.user.delete({ where: { clerkId: id } }).catch(() => {
          // Ignorer si l'utilisateur n'existe pas en DB
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
}
