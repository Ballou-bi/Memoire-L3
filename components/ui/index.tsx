"use client";

// ── Button ─────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "green";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const btnBase: React.CSSProperties = {
  borderRadius: "10px",
  fontFamily: "inherit",
  fontWeight: 600,
  letterSpacing: "0.01em",
  cursor: "pointer",
  transition: "all 0.15s",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  border: "none",
};

const btnVariants = {
  primary: { background: "var(--ci-orange)", color: "#FFFFFF" },
  green: { background: "var(--ci-green)", color: "#FFFFFF" },
  outline: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1.5px solid var(--border-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
  },
  danger: {
    background: "#FEF2F2",
    color: "#EF4444",
    border: "1.5px solid #FECACA",
  },
};

const btnSizes = {
  sm: { padding: "0.45rem 0.875rem", fontSize: "0.78rem" },
  md: { padding: "0.65rem 1.25rem", fontSize: "0.85rem" },
  lg: { padding: "0.85rem 1.75rem", fontSize: "0.92rem" },
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...btnBase,
        ...btnVariants[variant],
        ...btnSizes[size],
        opacity: disabled || loading ? 0.55 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
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

// ── Badge ──────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: "orange" | "green" | "gray" | "red" | "blue";
}

const badgeThemes = {
  orange: {
    bg: "var(--ci-orange-light)",
    color: "var(--ci-orange)",
    border: "var(--ci-orange-mid)",
  },
  green: {
    bg: "var(--ci-green-light)",
    color: "var(--ci-green)",
    border: "var(--ci-green-mid)",
  },
  gray: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  red: { bg: "#FEF2F2", color: "#EF4444", border: "#FECACA" },
  blue: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
};

export function Badge({ children, color = "gray" }: BadgeProps) {
  const t = badgeThemes[color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        padding: "0.2rem 0.65rem",
        borderRadius: "100px",
        fontSize: "0.72rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────────
const statusMap = {
  EN_ATTENTE: { label: "En attente", color: "orange" as const },
  VALIDEE: { label: "Validée", color: "green" as const },
  REJETEE: { label: "Rejetée", color: "red" as const },
};

export function StatusBadge({ statut }: { statut: keyof typeof statusMap }) {
  const s = statusMap[statut] ?? { label: statut, color: "gray" as const };
  return (
    <Badge color={s.color}>
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
      {s.label}
    </Badge>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, style, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          background: "#FAFAFA",
          border: `1.5px solid ${error ? "#FECACA" : "var(--border)"}`,
          borderRadius: "10px",
          padding: "0.65rem 0.875rem",
          color: "var(--text-primary)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--ci-orange)")}
        onBlur={(e) =>
          (e.target.style.borderColor = error ? "#FECACA" : "var(--border)")
        }
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#EF4444" }}>{error}</span>
      )}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
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
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        style={{
          background: "#FAFAFA",
          border: `1.5px solid ${error ? "#FECACA" : "var(--border)"}`,
          borderRadius: "10px",
          padding: "0.65rem 0.875rem",
          color: "var(--text-primary)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          cursor: "pointer",
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#EF4444" }}>{error}</span>
      )}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
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
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        style={{
          background: "#FAFAFA",
          border: `1.5px solid ${error ? "#FECACA" : "var(--border)"}`,
          borderRadius: "10px",
          padding: "0.65rem 0.875rem",
          color: "var(--text-primary)",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          width: "100%",
          resize: "vertical",
          minHeight: "100px",
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#EF4444" }}>{error}</span>
      )}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
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
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "var(--ci-orange-light)",
          border: "1px solid var(--ci-orange-mid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
          fontSize: "1.5rem",
        }}
      >
        📄
      </div>
      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
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

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid var(--border)`,
        borderTopColor: "var(--ci-orange)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
