"use client";

// ── Button ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const btnStyles = {
  primary: {
    background: "var(--gold)",
    color: "var(--navy)",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--cream)",
    border: "1px solid rgba(248,244,237,0.25)",
  },
  ghost: {
    background: "transparent",
    color: "var(--cream)",
    border: "1px solid transparent",
  },
  danger: {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.3)",
  },
};

const sizeStyles = {
  sm: { padding: "0.4rem 1rem", fontSize: "0.75rem" },
  md: { padding: "0.65rem 1.5rem", fontSize: "0.82rem" },
  lg: { padding: "0.9rem 2rem", fontSize: "0.9rem" },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...btnStyles[variant],
        ...sizeStyles[size],
        borderRadius: "2px",
        fontFamily: "inherit",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </button>
  );
}

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: "gold" | "green" | "red" | "blue" | "gray";
}

const badgeColors = {
  gold: {
    bg: "rgba(201,168,76,0.12)",
    border: "rgba(201,168,76,0.3)",
    color: "var(--gold)",
  },
  green: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    color: "#4ade80",
  },
  red: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    color: "#f87171",
  },
  blue: {
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.3)",
    color: "#60a5fa",
  },
  gray: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    color: "rgba(248,244,237,0.6)",
  },
};

export function Badge({ children, color = "gray" }: BadgeProps) {
  const c = badgeColors[color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        padding: "0.2rem 0.65rem",
        borderRadius: "100px",
        fontSize: "0.7rem",
        fontWeight: 500,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ── StatusBadge ──────────────────────────────────────────────
const statusConfig = {
  EN_ATTENTE: { label: "En attente", color: "gold" as const },
  VALIDEE: { label: "Validée", color: "green" as const },
  REJETEE: { label: "Rejetée", color: "red" as const },
};

export function StatusBadge({ statut }: { statut: keyof typeof statusConfig }) {
  const config = statusConfig[statut] ?? {
    label: statut,
    color: "gray" as const,
  };
  return (
    <Badge color={config.color}>
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "currentColor",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {config.label}
    </Badge>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: "4px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Input ────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--gold)",
            opacity: 0.8,
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(201,168,76,0.2)"}`,
          borderRadius: "2px",
          padding: "0.65rem 0.875rem",
          color: "var(--cream)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
        onBlur={(e) =>
          (e.target.style.borderColor = error
            ? "rgba(239,68,68,0.5)"
            : "rgba(201,168,76,0.2)")
        }
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#f87171" }}>{error}</span>
      )}
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--gold)",
            opacity: 0.8,
          }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        style={{
          background: "#0d1e38",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(201,168,76,0.2)"}`,
          borderRadius: "2px",
          padding: "0.65rem 0.875rem",
          color: "var(--cream)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          cursor: "pointer",
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#f87171" }}>{error}</span>
      )}
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--gold)",
            opacity: 0.8,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(201,168,76,0.2)"}`,
          borderRadius: "2px",
          padding: "0.65rem 0.875rem",
          color: "var(--cream)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          resize: "vertical",
          minHeight: "100px",
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#f87171" }}>{error}</span>
      )}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          color: "var(--gold)",
          opacity: 0.5,
          fontSize: "1.5rem",
        }}
      >
        ○
      </div>
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.3rem",
          color: "var(--cream)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--cream)",
            opacity: 0.45,
            maxWidth: "360px",
            margin: "0 auto",
          }}
        >
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: "1.5rem" }}>{action}</div>}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(201,168,76,0.2)`,
        borderTopColor: "var(--gold)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
