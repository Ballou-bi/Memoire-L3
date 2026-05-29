"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: "orange" | "green" | "white" | "dark";
  icon?: React.ReactNode;
  featured?: boolean;
  arrow?: boolean;
}

export default function StatsCard({
  label,
  value,
  sub,
  color = "white",
  icon,
  arrow = true,
}: StatsCardProps) {
  const themes = {
    orange: {
      bg: "var(--ci-orange)",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.75)",
      subBg: "rgba(255,255,255,0.18)",
      subText: "#FFFFFF",
      arrowBg: "rgba(255,255,255,0.2)",
      arrowColor: "#FFFFFF",
    },
    green: {
      bg: "var(--ci-green)",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.75)",
      subBg: "rgba(255,255,255,0.18)",
      subText: "#FFFFFF",
      arrowBg: "rgba(255,255,255,0.2)",
      arrowColor: "#FFFFFF",
    },
    white: {
      bg: "var(--bg-card)",
      text: "var(--text-primary)",
      textMuted: "var(--text-muted)",
      subBg: "var(--ci-green-light)",
      subText: "var(--ci-green)",
      arrowBg: "var(--border)",
      arrowColor: "var(--text-secondary)",
    },
    dark: {
      bg: "var(--sidebar-bg)",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.6)",
      subBg: "rgba(247,127,0,0.2)",
      subText: "#F77F00",
      arrowBg: "rgba(255,255,255,0.1)",
      arrowColor: "#FFFFFF",
    },
  };

  const t = themes[color];

  return (
    <div
      style={{
        background: t.bg,
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: color === "white" ? "var(--shadow-sm)" : "var(--shadow-md)",
        border: color === "white" ? "1px solid var(--border)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          color === "white" ? "var(--shadow-sm)" : "var(--shadow-md)";
      }}
    >
      {/* Cercle décoratif */}
      <div
        style={{
          position: "absolute",
          bottom: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: t.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
        {arrow && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: t.arrowBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.arrowColor,
              fontSize: "0.8rem",
              flexShrink: 0,
            }}
          >
            ↗
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "2.5rem",
          fontWeight: 700,
          color: t.text,
          lineHeight: 1,
          marginBottom: "0.75rem",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: t.subBg,
            borderRadius: "100px",
            padding: "0.2rem 0.65rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: t.subText,
          }}
        >
          <span>↑</span>
          {sub}
        </div>
      )}
    </div>
  );
}
