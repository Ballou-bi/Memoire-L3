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
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10,22,40,0.6)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
            fontWeight: 600,
            color: "var(--cream)",
            lineHeight: 1.1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--cream)",
              opacity: 0.5,
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
