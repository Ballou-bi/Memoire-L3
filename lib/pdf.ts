// lib/pdf.ts — serveur uniquement, pas de 'use client'
import QRCode from "qrcode";

interface ExtraitComplet {
  id: string;
  type: "INTEGRALE" | "AVEC_FILIATION" | "SANS_FILIATION";
  createdAt: Date;
  declaration: {
    nomEnfant: string;
    prenomEnfant: string;
    dateNaissance: Date;
    lieuNaissance: string;
    sexe: string;
    nomPere: string;
    prenomPere: string;
    professionPere: string | null;
    nationalitePere: string | null;
    residencePere: string | null;
    nomMere: string;
    prenomMere: string;
    professionMere: string | null;
    nationaliteMere: string | null;
    residenceMere: string | null;
    acte: { numero: string; dateValidation: Date } | null;
  };
  user: { nom: string; prenom: string };
}

const TYPE_LABELS: Record<string, string> = {
  INTEGRALE: "COPIE INTEGRALE",
  AVEC_FILIATION: "EXTRAIT AVEC FILIATION",
  SANS_FILIATION: "EXTRAIT SANS FILIATION",
};

export async function generatePDF(extrait: ExtraitComplet): Promise<Buffer> {
  // Import dynamique — obligatoire pour éviter les conflits de types SSR Next.js
  const ReactPDF = await import("@react-pdf/renderer");
  const { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } =
    ReactPDF;

  const React = await import("react");

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verifier/${extrait.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 120,
    margin: 1,
  });

  const styles = StyleSheet.create({
    page: {
      padding: 50,
      fontFamily: "Helvetica",
      fontSize: 11,
      color: "#1a1a1a",
    },
    watermark: {
      position: "absolute",
      top: "40%",
      left: "10%",
      fontSize: 70,
      color: "#f0f0f0",
      fontFamily: "Helvetica-Bold",
      transform: "rotate(-35deg)",
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
      borderBottomWidth: 2,
      borderBottomColor: "#c9a84c",
      paddingBottom: 16,
    },
    republic: {
      fontSize: 9,
      color: "#666",
      letterSpacing: 2,
      marginBottom: 4,
    },
    title: {
      fontSize: 17,
      fontFamily: "Helvetica-Bold",
      color: "#0a1628",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 9,
      color: "#888",
      letterSpacing: 1,
    },
    acteNum: {
      marginTop: 6,
      fontSize: 10,
      color: "#c9a84c",
      fontFamily: "Helvetica-Bold",
    },
    typeLabel: {
      marginTop: 5,
      fontSize: 9,
      letterSpacing: 1,
      color: "#c9a84c",
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: "#c9a84c",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: "#e8d5a3",
      paddingBottom: 4,
    },
    row: {
      flexDirection: "row",
      marginBottom: 6,
    },
    label: {
      width: 175,
      fontSize: 10,
      color: "#666",
    },
    value: {
      flex: 1,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
    },
    spacer: {
      marginTop: 6,
    },
    footer: {
      position: "absolute",
      bottom: 36,
      left: 50,
      right: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderTopWidth: 0.5,
      borderTopColor: "#ddd",
      paddingTop: 12,
    },
    footerLeft: {
      flex: 1,
    },
    footerText: {
      fontSize: 8,
      color: "#999",
      marginBottom: 2,
    },
    footerTextLast: {
      fontSize: 8,
      color: "#999",
      marginBottom: 2,
      marginTop: 5,
    },
    qr: {
      width: 75,
      height: 75,
    },
  });

  const d = extrait.declaration;

  const fmt = (date: Date | string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // Fonction pour créer une ligne label/valeur
  // Retourne null si la valeur est vide — pas affichée dans le PDF
  const makeRow = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return React.createElement(
      View,
      { style: styles.row },
      React.createElement(Text, { style: styles.label }, label + " :"),
      React.createElement(Text, { style: styles.value }, value),
    );
  };

  // Section enfant
  const sectionEnfant = React.createElement(
    View,
    { style: styles.section },
    React.createElement(
      Text,
      { style: styles.sectionTitle },
      "Informations de l'enfant",
    ),
    makeRow("Nom", d.nomEnfant),
    makeRow("Prenom", d.prenomEnfant),
    makeRow("Date de naissance", fmt(d.dateNaissance)),
    makeRow("Lieu de naissance", d.lieuNaissance),
    makeRow("Sexe", d.sexe === "M" ? "Masculin" : "Feminin"),
  );

  // Section filiation (père + mère)
  const sectionFiliation =
    extrait.type !== "SANS_FILIATION"
      ? React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Filiation",
          ),
          // Père
          makeRow("Pere", `${d.prenomPere} ${d.nomPere}`),
          makeRow("Profession du pere", d.professionPere),
          makeRow("Nationalite du pere", d.nationalitePere),
          makeRow("Residence du pere", d.residencePere),
          // Espacement
          React.createElement(View, { style: styles.spacer }),
          // Mère
          makeRow("Mere", `${d.prenomMere} ${d.nomMere}`),
          makeRow("Profession de la mere", d.professionMere),
          makeRow("Nationalite de la mere", d.nationaliteMere),
          makeRow("Residence de la mere", d.residenceMere),
        )
      : null;

  // Pied de page
  const footer = React.createElement(
    View,
    { style: styles.footer },
    React.createElement(
      View,
      { style: styles.footerLeft },
      React.createElement(
        Text,
        { style: styles.footerText },
        `Document delivre le : ${fmt(extrait.createdAt)}`,
      ),
      d.acte
        ? React.createElement(
            Text,
            { style: styles.footerText },
            `Acte valide le : ${fmt(d.acte.dateValidation)}`,
          )
        : null,
      React.createElement(
        Text,
        { style: styles.footerText },
        `Demande par : ${extrait.user.prenom} ${extrait.user.nom}`,
      ),
      React.createElement(
        Text,
        { style: styles.footerTextLast },
        "Verifiez l'authenticite en scannant le QR code",
      ),
    ),
    React.createElement(Image, { src: qrDataUrl, style: styles.qr }),
  );

  // Document complet
  const doc = React.createElement(
    Document,
    {
      title: `Extrait de naissance - ${d.prenomEnfant} ${d.nomEnfant}`,
      author: "RegistreNatal",
    },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Filigrane
      React.createElement(Text, { style: styles.watermark }, "OFFICIEL"),
      // En-tête
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          Text,
          { style: styles.republic },
          "REPUBLIQUE — ETAT CIVIL",
        ),
        React.createElement(
          Text,
          { style: styles.title },
          "Extrait d'Acte de Naissance",
        ),
        React.createElement(
          Text,
          { style: styles.subtitle },
          "DOCUMENT OFFICIEL CERTIFIE",
        ),
        d.acte
          ? React.createElement(
              Text,
              { style: styles.acteNum },
              `N° ${d.acte.numero}`,
            )
          : null,
        React.createElement(
          Text,
          { style: styles.typeLabel },
          TYPE_LABELS[extrait.type] ?? extrait.type,
        ),
      ),
      sectionEnfant,
      sectionFiliation,
      footer,
    ),
  );

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
