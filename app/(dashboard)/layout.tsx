import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/dashboard/Sidebar";
import type { Role } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Chercher l'user en DB par clerkId
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  // Si absent (webhook pas encore reçu) → upsert à la volée
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    // upsert : si l'email existe déjà en DB → met à jour le clerkId
    // sinon → crée l'utilisateur
    // Évite l'erreur "Unique constraint failed on email"
    user = await prisma.user.upsert({
      where: { email },
      update: { clerkId: userId },
      create: {
        clerkId: userId,
        email,
        nom: clerkUser.lastName ?? "",
        prenom: clerkUser.firstName ?? "",
        role: "CITOYEN",
      },
    });
  }

  // SOURCE UNIQUE DU RÔLE : la base de données
  const role = user.role as Role;

  return (
    <div className="db-layout">
      <Sidebar role={role} userName={`${user.prenom} ${user.nom}`} />
      <main className="db-main">{children}</main>
    </div>
  );
}
