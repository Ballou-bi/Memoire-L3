import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/dashboard/Header";
import DeclarationForm from "@/components/forms/DeclarationForm";
import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouvelle déclaration" };

export default async function NewDeclarationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  // Redirection selon rôle DB — source de vérité
  if (user.role === "OFFICIER") redirect("/officier");
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <>
      <Header
        title="Déclarer une naissance"
        subtitle="Remplissez le formulaire pour soumettre une déclaration officielle"
      />

      <div className="db-content animate-fade-up" style={{ maxWidth: "760px" }}>
        <div
          style={{
            background: "rgba(201,168,76,0.06)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            fontSize: "0.82rem",
            lineHeight: 1.7,
            opacity: 0.85,
            color: "white",
          }}
        >
          <strong
            style={{
              color: "var( --ci-orange)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            À savoir avant de commencer
          </strong>
          La déclaration sera examinée par un officier d&apos;état civil sous
          72h. Une fois validée, vous pourrez télécharger l&apos;extrait de
          naissance certifié avec un QR Code d&apos;authenticité.
        </div>

        <Card style={{ padding: "2rem" }}>
          <DeclarationForm />
        </Card>
      </div>
    </>
  );
}
