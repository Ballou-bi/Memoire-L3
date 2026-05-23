interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: "gold" | "green" | "red" | "blue";
  icon?: React.ReactNode;
}

const colorMap = {
  gold: "var(--gold)",
  green: "var(--success)",
  red: "var(--danger)",
  blue: "#60a5fa",
};

export default function StatsCard({
  label,
  value,
  sub,
  color = "gold",
  icon,
}: StatsCardProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: "4px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${colorMap[color]}, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--cream)",
              opacity: 0.45,
              marginBottom: "0.75rem",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.25rem",
              fontWeight: 600,
              color: colorMap[color],
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--cream)",
                opacity: 0.4,
                marginTop: "0.4rem",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colorMap[color],
              opacity: 0.7,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
