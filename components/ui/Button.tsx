"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
}

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    borderRadius: "2px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  },
  sizes: {
    sm: { fontSize: "0.72rem", padding: "0.5rem 1.2rem" },
    md: { fontSize: "0.8rem", padding: "0.75rem 1.8rem" },
    lg: { fontSize: "0.85rem", padding: "1rem 2.5rem" },
  },
  variants: {
    primary: { background: "var(--gold)", color: "var(--navy)" },
    outline: {
      background: "transparent",
      color: "var(--cream)",
      border: "1px solid rgba(248,244,237,0.2)",
    },
    ghost: {
      background: "transparent",
      color: "var(--cream-dim)",
      border: "1px solid transparent",
    },
    danger: {
      background: "rgba(248,113,113,0.12)",
      color: "#f87171",
      border: "1px solid rgba(248,113,113,0.25)",
    },
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  href,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const combinedStyle = {
    ...styles.base,
    ...styles.sizes[size],
    ...styles.variants[variant],
    ...(disabled || loading ? { opacity: 0.5, cursor: "not-allowed" } : {}),
    ...style,
  };

  if (href) {
    return (
      <a href={href} style={combinedStyle as React.CSSProperties}>
        {children}
      </a>
    );
  }

  return (
    <button style={combinedStyle} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              animation: "spin 0.6s linear infinite",
              display: "inline-block",
            }}
          />
          Chargement…
        </>
      ) : (
        children
      )}
    </button>
  );
}
