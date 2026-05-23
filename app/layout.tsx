import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "waya", template: "%s — waya" },
  description: "Plateforme officielle de digitalisation des actes de naissance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
