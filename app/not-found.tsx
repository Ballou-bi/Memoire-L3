import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1.5rem",
        textAlign: "center",
        padding: "2rem",
        background: "var(--navy)",
      }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "6rem",
          fontWeight: 700,
          color: "var(--gold)",
          lineHeight: 1,
          opacity: 0.3,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.75rem",
          fontWeight: 600,
          color: "var(--cream)",
        }}
      >
        Page introuvable
      </h1>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--cream)",
          opacity: 0.5,
          maxWidth: "360px",
          lineHeight: 1.7,
        }}
      >
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        style={{
          background: "var(--gold)",
          color: "var(--navy)",
          padding: "0.75rem 2rem",
          borderRadius: "2px",
          textDecoration: "none",
          fontSize: "0.82rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
