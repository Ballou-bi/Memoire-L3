import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vérification d'extrait — waya" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerifierPage({ params }: Props) {
  const { id } = await params;

  const extrait = await prisma.extrait.findUnique({
    where: { id },
    include: {
      declaration: {
        include: {
          acte: true,
          citoyen: { select: { nom: true, prenom: true } },
        },
      },
    },
  });

  // ── Document non trouvé ──────────────────────────────────────────────────────
  if (!extrait || !extrait.declaration.acte) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div
            style={{
              ...styles.badge,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <span style={{ color: "#ef4444", fontSize: "1.5rem" }}>✗</span>
          </div>
          <h1 style={{ ...styles.title, color: "#ef4444" }}>
            Document invalide
          </h1>
          <p style={styles.sub}>
            Ce document n&#39;a pas pu être vérifié. Il est peut-être invalide
            ou n&apos;existe pas dans notre système.
          </p>
          <div style={styles.idBox}>
            <span style={styles.idLabel}>ID recherché</span>
            <span style={styles.idValue}>{id}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const d = extrait.declaration;
  const acte = d.acte!;

  const typeLabel: Record<string, string> = {
    INTEGRALE: "Copie intégrale",
    AVEC_FILIATION: "Extrait avec filiation",
    SANS_FILIATION: "Extrait sans filiation",
  };

  // ── Document valide ──────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Bandeau tricolore haut */}
        <div style={styles.flagBand}>
          <div style={{ flex: 1, background: "#f77f00" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#009a44" }} />
        </div>

        {/* Icône succès */}
        <div style={styles.iconWrapper}>
          <div style={styles.badge}>
            <span
              style={{ color: "#009a44", fontSize: "1.75rem", lineHeight: 1 }}
            >
              ✓
            </span>
          </div>
          <h1 style={styles.title}>Document authentique</h1>
          <p style={styles.sub}>
            Cet extrait d&#39;acte de naissance est certifié et enregistré dans
            le système waya.
          </p>
        </div>

        {/* Acte */}
        <div style={styles.acteBox}>
          <span style={styles.acteLabel}>N° Acte</span>
          <span style={styles.acteNum}>{acte.numero}</span>
          <span style={styles.acteDate}>
            Validé le {formatDate(acte.dateValidation)}
          </span>
        </div>

        {/* Infos enfant */}
        <Section title="Enfant" color="#f77f00">
          <Field
            label="Nom complet"
            value={`${d.prenomEnfant} ${d.nomEnfant}`}
          />
          <Field
            label="Date de naissance"
            value={formatDate(d.dateNaissance)}
          />
          <Field label="Lieu de naissance" value={d.lieuNaissance} />
          <Field label="Sexe" value={d.sexe === "M" ? "Masculin" : "Féminin"} />
        </Section>

        {/* Type extrait */}
        <Section title="Extrait" color="#009a44">
          <Field label="Type" value={typeLabel[extrait.type] ?? extrait.type} />
          <Field label="Délivré le" value={formatDate(extrait.createdAt)} />
          <Field
            label="Demandé par"
            value={`${d.citoyen.prenom} ${d.citoyen.nom}`}
          />
        </Section>

        {/* Bandeau tricolore bas */}
        <div style={{ ...styles.flagBand, marginTop: "1.5rem" }}>
          <div style={{ flex: 1, background: "#f77f00" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#009a44" }} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Composants internes ────────────────────────────────────────────────────────
function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.6rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "12px",
            background: color,
            borderRadius: "2px",
          }}
        />
        <span
          style={{
            fontSize: "0.62rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "0.875rem 1rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "0.5rem",
        gap: "1rem",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.4)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 500,
          color: "white",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Footer() {
  return (
    <p
      style={{
        marginTop: "1.25rem",
        fontSize: "0.72rem",
        color: "rgba(255,255,255,0.25)",
        textAlign: "center",
      }}
    >
      waya · République de Côte d&rsquo;Ivoire
    </p>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#070f09",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  flagBand: {
    display: "flex",
    height: "7px",
  },
  iconWrapper: {
    padding: "1.5rem 1.5rem 0",
    textAlign: "center",
  },
  badge: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "rgba(0,154,68,0.12)",
    border: "1.5px solid rgba(0,154,68,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.4rem",
    fontWeight: 600,
    color: "white",
    margin: "0 0 0.4rem",
  },
  sub: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.6,
    margin: "0 0 1.25rem",
  },
  acteBox: {
    margin: "0 1.5rem 1.25rem",
    background: "rgba(0,154,68,0.07)",
    border: "1px solid rgba(0,154,68,0.2)",
    borderRadius: "10px",
    padding: "0.875rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  },
  acteLabel: {
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.35)",
  },
  acteNum: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#009a44",
    letterSpacing: "0.05em",
  },
  acteDate: {
    fontSize: "0.72rem",
    color: "rgba(255,255,255,0.35)",
  },
  idBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    marginTop: "1rem",
    padding: "0.75rem",
    background: "rgba(239,68,68,0.06)",
    borderRadius: "8px",
    margin: "1rem 1.5rem 1.5rem",
  },
  idLabel: {
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.3)",
  },
  idValue: {
    fontSize: "0.72rem",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "monospace",
    wordBreak: "break-all",
    textAlign: "center",
  },
};
