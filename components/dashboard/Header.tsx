interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      style={{
        padding: "1.25rem 2rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-card)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexShrink: 0,
            marginLeft: "1rem",
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
