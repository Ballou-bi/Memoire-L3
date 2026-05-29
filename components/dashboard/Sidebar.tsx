/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Ico = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  home: <Ico d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />,
  file: (
    <Ico d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
  ),
  download: (
    <Ico d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
  ),
  check: <Ico d="M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3" />,
  users: (
    <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />
  ),
  chart: <Ico d="M18 20V10 M12 20V4 M6 20v-6" />,
  plus: <Ico d="M12 5v14 M5 12h14" />,
  menu: <Ico d="M3 6h18 M3 12h18 M3 18h18" />,
  x: <Ico d="M18 6L6 18 M6 6l12 12" />,
};

const navByRole: Record<Role, NavItem[]> = {
  CITOYEN: [
    { label: "Tableau de bord", href: "/citoyen", icon: icons.home },
    {
      label: "Mes déclarations",
      href: "/citoyen/declaration",
      icon: icons.file,
    },
    {
      label: "Nouvelle déclaration",
      href: "/citoyen/declaration/new",
      icon: icons.plus,
    },
    { label: "Mes extraits", href: "/citoyen/extraits", icon: icons.download },
  ],
  OFFICIER: [
    { label: "Tableau de bord", href: "/officier", icon: icons.home },
    { label: "Déclarations", href: "/officier/declaration", icon: icons.check },
    { label: "Statistiques", href: "/officier/stats", icon: icons.chart },
  ],
  ADMIN: [
    { label: "Tableau de bord", href: "/admin", icon: icons.home },
    { label: "Déclarations", href: "/admin/declarations", icon: icons.file },
    { label: "Extraits", href: "/admin/extraits", icon: icons.download },
    { label: "Utilisateurs", href: "/admin/users", icon: icons.users },
    { label: "Statistiques", href: "/admin/stats", icon: icons.chart },
  ],
};

const roleLabel: Record<Role, string> = {
  CITOYEN: "Espace Citoyen",
  OFFICIER: "Espace Officier",
  ADMIN: "Administration",
};

function NavContent({
  role,
  userName,
  onLink,
}: {
  role: Role;
  userName: string;
  onLink?: () => void;
}) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <>
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }} onClick={onLink}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {/* Drapeau CI mini */}
            <div
              style={{
                display: "flex",
                borderRadius: "6px",
                overflow: "hidden",
                width: "28px",
                height: "20px",
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, background: "#F77F00" }} />
              <div style={{ flex: 1, background: "#FFFFFF" }} />
              <div style={{ flex: 1, background: "#009A44" }} />
            </div>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              Waya
            </span>
          </div>
        </Link>
        <div
          style={{
            marginTop: "0.35rem",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
          }}
        >
          {roleLabel[role]}
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
        <span
          style={{
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
          }}
        >
          Menu
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 0.75rem", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/citoyen" &&
                item.href !== "/officier" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLink}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                  background: isActive ? "rgba(247,127,0,0.18)" : "transparent",
                  borderLeft: isActive
                    ? "3px solid #F77F00"
                    : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    opacity: isActive ? 1 : 0.6,
                    flexShrink: 0,
                    color: isActive ? "#F77F00" : "inherit",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <UserButton />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: "1px",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({
  role,
  userName,
}: {
  role: Role;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarStyle = {
    background: "var(--sidebar-bg)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <>
      {/* Desktop */}
      <aside
        className="sidebar-desktop"
        style={{
          ...sidebarStyle,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "var(--sidebar-width)",
          zIndex: 50,
        }}
      >
        <NavContent role={role} userName={userName} />
      </aside>

      {/* Mobile bar */}
      <div
        className="sidebar-mobile-bar"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "var(--sidebar-bg)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          zIndex: 60,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: "5px",
              overflow: "hidden",
              width: "22px",
              height: "16px",
            }}
          >
            <div style={{ flex: 1, background: "#F77F00" }} />
            <div style={{ flex: 1, background: "#FFFFFF" }} />
            <div style={{ flex: 1, background: "#009A44" }} />
          </div>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Waya
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "8px",
            padding: "0.4rem",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
          }}
        >
          {icons.menu}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 70,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          ...sidebarStyle,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "270px",
          zIndex: 80,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "8px",
            padding: "0.35rem",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            zIndex: 1,
          }}
        >
          {icons.x}
        </button>
        <NavContent
          role={role}
          userName={userName}
          onLink={() => setOpen(false)}
        />
      </aside>
    </>
  );
}
