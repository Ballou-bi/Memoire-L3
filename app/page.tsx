import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LandingClient from "./LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waya — L'extrait de naissance à l'ère numérique",
  description:
    "Plateforme moderne de déclaration, validation et délivrance des extraits de naissance.",
};

export default async function LandingPage() {
  // Si l'utilisateur est déjà connecté → rediriger vers son dashboard
  const { userId } = await auth();

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user) {
      switch (user.role) {
        case "ADMIN":
          redirect("/admin");
        case "OFFICIER":
          redirect("/officier");
        default:
          redirect("/citoyen");
      }
    }
  }

  return <LandingClient />;
}
