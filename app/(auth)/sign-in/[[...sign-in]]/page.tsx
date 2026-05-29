import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ci-bg)",
        padding: "2rem",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--ci-orange)",
          textDecoration: "none",
          marginBottom: "2rem",
          letterSpacing: "0.05em",
        }}
      >
        wa<span style={{ color: "var(--cream)" }}>ya</span>
      </Link>
      <SignIn />
    </div>
  );
}
