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

// ── Icônes ───────────────────────────────────────────────────────────────────
const IconHome = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconFile = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconUsers = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconChart = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconX = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconMenu = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const navByRole: Record<Role, NavItem[]> = {
  CITOYEN: [
    { label: "Tableau de bord", href: "/citoyen", icon: <IconHome /> },
    {
      label: "Mes déclarations",
      href: "/citoyen/declaration",
      icon: <IconFile />,
    },
    {
      label: "Nouvelle déclaration",
      href: "/citoyen/declaration/new",
      icon: <IconPlus />,
    },
    {
      label: "Mes extraits",
      href: "/citoyen/extraits",
      icon: <IconDownload />,
    },
  ],
  OFFICIER: [
    { label: "Tableau de bord", href: "/officier", icon: <IconHome /> },
    {
      label: "Déclarations",
      href: "/officier/declaration",
      icon: <IconCheck />,
    },
    { label: "Statistiques", href: "/officier/stats", icon: <IconChart /> },
  ],
  ADMIN: [
    { label: "Tableau de bord", href: "/admin", icon: <IconHome /> },
    { label: "Déclarations", href: "/admin/declarations", icon: <IconFile /> },
    { label: "Extraits", href: "/admin/extraits", icon: <IconDownload /> },
    { label: "Utilisateurs", href: "/admin/users", icon: <IconUsers /> },
    { label: "Statistiques", href: "/admin/stats", icon: <IconChart /> },
  ],
};

const roleLabel: Record<Role, string> = {
  CITOYEN: "Espace Citoyen",
  OFFICIER: "Espace Officier",
  ADMIN: "Administration",
};

// ── Contenu de la sidebar (réutilisé desktop + mobile) ───────────────────────
function SidebarContent({
  role,
  userName,
  onLinkClick,
}: {
  role: Role;
  userName: string;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <>
      {/* Logo */}
      <div
        style={{
          padding: "1.75rem 1.5rem 1.25rem",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }} onClick={onLinkClick}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            wa<span style={{ color: "var(--cream)" }}>ya</span>
          </span>
        </Link>
        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--gold)",
            opacity: 0.6,
          }}
        >
          {roleLabel[role]}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
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
                onClick={onLinkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 0.875rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 500 : 300,
                  color: isActive ? "var(--gold)" : "var(--cream)",
                  background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(201,168,76,0.2)"
                    : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.5, flexShrink: 0 }}>
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
          borderTop: "1px solid rgba(201,168,76,0.1)",
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
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              opacity: 0.45,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sidebar principale ────────────────────────────────────────────────────────
export default function Sidebar({
  role,
  userName,
}: {
  role: Role;
  userName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le menu mobile à chaque changement de page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── DESKTOP — sidebar fixe ──────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "var(--sidebar-width)",
          background: "rgba(10,22,40,0.98)",
          borderRight: "1px solid rgba(201,168,76,0.12)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          backdropFilter: "blur(16px)",
          // Caché sur mobile
          visibility: "visible",
        }}
        className="sidebar-desktop"
      >
        <SidebarContent role={role} userName={userName} />
      </aside>

      {/* ── MOBILE — barre top avec hamburger ──────────────────────────── */}
      <div
        className="sidebar-mobile-bar"
        style={{
          display: "none", // affiché via CSS media query dans globals.css
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "rgba(10,22,40,0.97)",
          borderBottom: "1px solid rgba(201,168,76,0.12)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          zIndex: 60,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Logo mobile */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            wa<span style={{ color: "var(--cream)" }}>ya</span>
          </span>
        </Link>

        {/* Bouton hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            padding: "0.4rem",
            color: "var(--cream)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Ouvrir le menu"
        >
          <IconMenu />
        </button>
      </div>

      {/* ── MOBILE — drawer overlay ─────────────────────────────────────── */}
      {/* Fond sombre */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 70,
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          background: "rgba(10,22,40,0.99)",
          borderRight: "1px solid rgba(201,168,76,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 80,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            padding: "0.35rem",
            color: "var(--cream)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
          aria-label="Fermer le menu"
        >
          <IconX />
        </button>

        <SidebarContent
          role={role}
          userName={userName}
          onLinkClick={() => setIsOpen(false)}
        />
      </aside>
    </>
  );
}
