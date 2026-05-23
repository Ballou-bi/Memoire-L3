/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";

export default function LandingClient() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --navy: #0a1628;
          --gold: #c9a84c;
          --gold-light: #e8d5a3;
          --cream: #f8f4ed;
          --accent: #1a3a5c;
          --white: #ffffff;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: var(--navy);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        /* NAV */
        .rn-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 4rem;
          background: rgba(10,22,40,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .rn-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.05em;
          text-decoration: none;
        }
        .rn-logo span { color: var(--cream); }
        .rn-nav ul {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }
        .rn-nav ul a {
          color: var(--cream);
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.75;
          transition: opacity 0.2s, color 0.2s;
        }
        .rn-nav ul a:hover { opacity: 1; color: var(--gold); }
        .rn-nav-cta {
          background: var(--gold);
          color: var(--navy);
          padding: 0.6rem 1.6rem;
          border-radius: 2px;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        .rn-nav-cta:hover { background: var(--gold-light); }

        /* HERO */
        .rn-hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 8rem 4rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .rn-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(26,58,92,0.6) 0%, transparent 70%);
          pointer-events: none;
        }
        .rn-hero-grid-line {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 50%;
          border-left: 1px solid rgba(201,168,76,0.08);
          pointer-events: none;
        }
        .rn-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.3);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 2rem;
          animation: rnFadeUp 0.8s ease both;
        }
        .rn-dot {
          width: 6px; height: 6px;
          background: var(--gold);
          border-radius: 50%;
          animation: rnPulse 2s infinite;
        }
        @keyframes rnPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .rn-hero-content {
          position: relative;
          z-index: 1;
        }
        .rn-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 5.5rem);
          font-weight: 600;
          line-height: 1.05;
          margin-bottom: 1.5rem;
          animation: rnFadeUp 0.8s 0.1s ease both;
        }
        .rn-h1 em { color: var(--gold); font-style: italic; }
        .rn-hero-desc {
          font-size: 1rem;
          line-height: 1.75;
          opacity: 0.7;
          max-width: 480px;
          margin-bottom: 3rem;
          animation: rnFadeUp 0.8s 0.2s ease both;
        }
        .rn-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          animation: rnFadeUp 0.8s 0.3s ease both;
        }
        .rn-btn-primary {
          background: var(--gold);
          color: var(--navy);
          padding: 1rem 2.5rem;
          border-radius: 2px;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          display: inline-block;
        }
        .rn-btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); }
        .rn-btn-outline {
          background: transparent;
          color: var(--cream);
          padding: 1rem 2.5rem;
          border-radius: 2px;
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid rgba(248,244,237,0.25);
          display: inline-block;
        }
        .rn-btn-outline:hover { border-color: var(--gold); color: var(--gold); }

        /* DOCUMENT MOCKUP */
        .rn-hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
          animation: rnFadeUp 0.8s 0.4s ease both;
        }
        .rn-doc-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 4px;
          padding: 2.5rem;
          width: 340px;
          position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.4);
        }
        .rn-doc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .rn-doc-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .rn-doc-crest {
          width: 48px; height: 48px;
          border: 2px solid var(--gold);
          border-radius: 50%;
          margin: 0 auto 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--gold);
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
        }
        .rn-doc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .rn-doc-subtitle {
          font-size: 0.7rem;
          opacity: 0.5;
          letter-spacing: 0.08em;
          margin-top: 0.25rem;
        }
        .rn-doc-field {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-bottom: 1rem;
        }
        .rn-doc-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--gold);
          opacity: 0.7;
        }
        .rn-doc-value {
          height: 10px;
          background: rgba(248,244,237,0.12);
          border-radius: 2px;
          width: 80%;
          animation: rnShimmer 2s infinite;
        }
        .rn-doc-value.short { width: 50%; }
        .rn-doc-value.medium { width: 65%; }
        @keyframes rnShimmer {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
        .rn-doc-qr {
          position: absolute;
          bottom: 1.5rem; right: 1.5rem;
          width: 50px; height: 50px;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 2px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          padding: 4px;
        }
        .rn-qr-cell {
          background: rgba(201,168,76,0.4);
          border-radius: 1px;
        }
        .rn-qr-cell:nth-child(2n+1) { opacity: 0.2; }
        .rn-qr-cell:nth-child(3n) { opacity: 0.8; }
        .rn-doc-seal {
          position: absolute;
          top: -15px; right: -15px;
          width: 60px; height: 60px;
          border: 2px solid rgba(201,168,76,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--navy);
          font-size: 0.55rem;
          text-align: center;
          color: var(--gold);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.3;
        }
        .rn-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #4ade80;
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          margin-top: 1rem;
        }
        .rn-status-dot {
          width: 5px; height: 5px;
          background: #4ade80;
          border-radius: 50%;
        }

        /* STATS */
        .rn-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 4rem;
          border: 1px solid rgba(201,168,76,0.1);
          animation: rnFadeUp 0.8s 0.5s ease both;
        }
        .rn-stat {
          padding: 2rem;
          text-align: center;
          background: rgba(255,255,255,0.02);
          transition: background 0.2s;
        }
        .rn-stat:hover { background: rgba(201,168,76,0.04); }
        .rn-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--gold);
          display: block;
          line-height: 1;
        }
        .rn-stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          opacity: 0.5;
          margin-top: 0.5rem;
        }

        /* FEATURES */
        .rn-features {
          padding: 6rem 4rem;
          border-top: 1px solid rgba(201,168,76,0.1);
        }
        .rn-section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--gold);
          margin-bottom: 1rem;
        }
        .rn-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3.5rem);
          font-weight: 600;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .rn-section-title em { color: var(--gold); font-style: italic; }
        .rn-features-grid {
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          gap: 4rem;
          align-items: start;
          margin-top: 4rem;
        }
        .rn-feature-list { display: flex; flex-direction: column; gap: 0; }
        .rn-feature-item {
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(201,168,76,0.1);
          cursor: pointer;
          transition: padding-left 0.3s;
        }
        .rn-feature-item:hover { padding-left: 0.75rem; }
        .rn-feature-item-num { font-size: 0.65rem; color: var(--gold); letter-spacing: 0.15em; margin-bottom: 0.5rem; }
        .rn-feature-item-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
        .rn-feature-item-desc { font-size: 0.85rem; opacity: 0.55; line-height: 1.6; }
        .rn-process-flow { display: flex; flex-direction: column; gap: 0; }
        .rn-process-step {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          padding: 1.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.08);
          border-bottom: none;
          transition: background 0.2s;
        }
        .rn-process-step:last-child { border-bottom: 1px solid rgba(201,168,76,0.08); }
        .rn-process-step:hover { background: rgba(201,168,76,0.04); }
        .rn-step-icon {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rn-step-icon svg { width: 18px; height: 18px; stroke: var(--gold); fill: none; stroke-width: 1.5; }
        .rn-step-info-title { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.3rem; }
        .rn-step-info-desc { font-size: 0.8rem; opacity: 0.5; line-height: 1.5; }
        .rn-step-arrow { margin-left: auto; opacity: 0.3; font-size: 0.8rem; align-self: center; color: var(--gold); }

        /* ROLES */
        .rn-roles {
          padding: 6rem 4rem;
          border-top: 1px solid rgba(201,168,76,0.1);
          background: rgba(255,255,255,0.01);
        }
        .rn-roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
        .rn-role-card {
          border: 1px solid rgba(201,168,76,0.12);
          padding: 2.5rem 2rem;
          border-radius: 2px;
          transition: border-color 0.3s, transform 0.3s;
          position: relative;
          overflow: hidden;
        }
        .rn-role-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 0;
          background: linear-gradient(to top, rgba(201,168,76,0.06), transparent);
          transition: height 0.3s;
        }
        .rn-role-card:hover { border-color: rgba(201,168,76,0.35); transform: translateY(-4px); }
        .rn-role-card:hover::before { height: 100%; }
        .rn-role-icon {
          width: 48px; height: 48px;
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .rn-role-icon svg { width: 22px; height: 22px; stroke: var(--gold); fill: none; stroke-width: 1.5; }
        .rn-role-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 600; margin-bottom: 0.75rem; }
        .rn-role-desc { font-size: 0.82rem; opacity: 0.55; line-height: 1.65; margin-bottom: 1.5rem; }
        .rn-role-perms { display: flex; flex-direction: column; gap: 0.5rem; }
        .rn-perm { display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; opacity: 0.7; }
        .rn-perm-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }

        /* CTA SECTION */
        .rn-cta {
          padding: 6rem 4rem;
          border-top: 1px solid rgba(201,168,76,0.1);
          text-align: center;
        }
        .rn-cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .rn-cta-title em { color: var(--gold); font-style: italic; }
        .rn-cta-desc { font-size: 0.95rem; opacity: 0.6; max-width: 480px; margin: 0 auto 2.5rem; line-height: 1.7; }
        .rn-cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .rn-footer {
          padding: 3rem 4rem;
          border-top: 1px solid rgba(201,168,76,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rn-footer-copy { font-size: 0.75rem; opacity: 0.35; }
        .rn-footer-links { display: flex; gap: 2rem; }
        .rn-footer-links a { font-size: 0.75rem; color: var(--cream); opacity: 0.35; text-decoration: none; transition: opacity 0.2s; }
        .rn-footer-links a:hover { opacity: 0.8; }

        @keyframes rnFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .rn-nav { padding: 1.2rem 1.5rem; }
          .rn-nav ul { display: none; }
          .rn-hero { grid-template-columns: 1fr; padding: 7rem 1.5rem 3rem; }
          .rn-hero-visual { display: none; }
          .rn-stats { grid-template-columns: 1fr; }
          .rn-features { padding: 4rem 1.5rem; }
          .rn-features-grid { grid-template-columns: 1fr; }
          .rn-roles { padding: 4rem 1.5rem; }
          .rn-roles-grid { grid-template-columns: 1fr; }
          .rn-cta { padding: 4rem 1.5rem; }
          .rn-footer { flex-direction: column; gap: 1rem; padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="rn-nav">
        <a href="/" className="rn-logo">
          wa<span>ya</span>
        </a>
        <ul>
          <li>
            <a href="#fonctionnalites">Fonctionnalités</a>
          </li>
          <li>
            <a href="#processus">Processus</a>
          </li>
          <li>
            <a href="#roles">Rôles</a>
          </li>
        </ul>
        {/* Se connecter → page Clerk sign-in */}
        <Link href="/sign-in" className="rn-nav-cta">
          Se connecter
        </Link>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="rn-hero">
        <div className="rn-hero-grid-line" />

        <div className="rn-hero-content">
          <div className="rn-hero-badge">
            <span className="rn-dot" />
            Mémoire L3 — Digitalisation Administrative
          </div>

          <h1 className="rn-h1">
            L&apos;extrait de
            <br />
            naissance à l&apos;ère
            <br />
            <em>numérique</em>
          </h1>

          <p className="rn-hero-desc">
            Une plateforme moderne qui digitalise entièrement le processus de
            déclaration, de validation et de délivrance des extraits de
            naissance — de la maternité au citoyen.
          </p>

          <div className="rn-hero-actions">
            {/*
              "Faire une demande" → sign-up si pas connecté.
              Le middleware redirigera vers /citoyen après inscription.
            */}
            <Link href="/sign-up" className="rn-btn-primary">
              Faire une demande
            </Link>
            <a href="#processus" className="rn-btn-outline">
              Voir le processus
            </a>
          </div>

          <div className="rn-stats">
            <div className="rn-stat">
              <span className="rn-stat-num">72h</span>
              <span className="rn-stat-label">Délai de délivrance</span>
            </div>
            <div className="rn-stat">
              <span className="rn-stat-num">100%</span>
              <span className="rn-stat-label">Traitement en ligne</span>
            </div>
            <div className="rn-stat">
              <span className="rn-stat-num">3</span>
              <span className="rn-stat-label">Types d&apos;extraits</span>
            </div>
          </div>
        </div>

        {/* Mockup document */}
        <div className="rn-hero-visual">
          <div style={{ position: "relative" }}>
            <div className="rn-doc-card">
              <div className="rn-doc-seal">OFFICIEL</div>
              <div className="rn-doc-header">
                <div className="rn-doc-crest">RN</div>
                <div className="rn-doc-title">
                  Extrait d&apos;Acte de Naissance
                </div>
                <div className="rn-doc-subtitle">RÉPUBLIQUE — ÉTAT CIVIL</div>
              </div>
              {[
                { label: "Nom et Prénom", cls: "" },
                { label: "Date de naissance", cls: "short" },
                { label: "Lieu de naissance", cls: "medium" },
                { label: "Nom du père", cls: "" },
                { label: "Nom de la mère", cls: "medium" },
              ].map(({ label, cls }) => (
                <div key={label} className="rn-doc-field">
                  <span className="rn-doc-label">{label}</span>
                  <div className={`rn-doc-value ${cls}`} />
                </div>
              ))}
              <div className="rn-doc-qr">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="rn-qr-cell" />
                ))}
              </div>
              <div className="rn-status-badge">
                <span className="rn-status-dot" />
                Validé et certifié
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="rn-features" id="fonctionnalites">
        <p className="rn-section-label">Fonctionnalités</p>
        <h2 className="rn-section-title">
          Tout le processus,
          <br />
          <em>repensé</em> numériquement
        </h2>

        <div className="rn-features-grid">
          <div className="rn-feature-list">
            {[
              {
                num: "01",
                title: "Déclaration en ligne",
                desc: "Soumission du formulaire de naissance par les parents depuis n'importe où, avec validation en temps réel des données.",
              },
              {
                num: "02",
                title: "Validation officielle",
                desc: "Les officiers d'état civil examinent, valident ou rejettent les déclarations avec un système de notification automatique.",
              },
              {
                num: "03",
                title: "Génération de PDF certifié",
                desc: "Extraits générés automatiquement avec QR Code de vérification pour garantir l'authenticité du document.",
              },
              {
                num: "04",
                title: "Suivi en temps réel",
                desc: "Tableau de bord citoyen avec suivi de l'état de chaque demande, de la soumission à la délivrance.",
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="rn-feature-item">
                <div className="rn-feature-item-num">{num}</div>
                <div className="rn-feature-item-title">{title}</div>
                <p className="rn-feature-item-desc">{desc}</p>
              </div>
            ))}
          </div>

          <div className="rn-process-flow" id="processus">
            {[
              {
                title: "Inscription du citoyen",
                desc: "Création du compte avec vérification d'identité basique",
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
              {
                title: "Soumission de la déclaration",
                desc: "Formulaire complet avec informations de l'enfant et des parents",
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
              },
              {
                title: "Validation par l'officier",
                desc: "Examen et approbation avec attribution du numéro d'acte",
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
              },
              {
                title: "Demande d'extrait",
                desc: "Choix du type (intégrale, avec filiation, sans filiation)",
                icon: (
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                ),
              },
              {
                title: "Téléchargement du PDF",
                desc: "Extrait certifié avec QR Code de vérification d'authenticité",
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                ),
              },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="rn-process-step">
                <div className="rn-step-icon">{icon}</div>
                <div className="rn-step-info">
                  <div className="rn-step-info-title">{title}</div>
                  <div className="rn-step-info-desc">{desc}</div>
                </div>
                <span className="rn-step-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────── */}
      <section className="rn-roles" id="roles">
        <p className="rn-section-label">Gestion des accès</p>
        <h2 className="rn-section-title">
          Trois profils,
          <br />
          <em>une</em> plateforme
        </h2>

        <div className="rn-roles-grid">
          {[
            {
              name: "Citoyen",
              desc: "Tout résident pouvant déclarer une naissance et faire une demande d'extrait en ligne.",
              perms: [
                "Créer une déclaration de naissance",
                "Faire une demande d'extrait",
                "Suivre l'état de ses demandes",
                "Télécharger ses extraits PDF",
              ],
              icon: (
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
              href: "/sign-up",
              cta: "S'inscrire comme citoyen",
            },
            {
              name: "Officier",
              desc: "Agent de l'état civil chargé d'examiner et de valider les déclarations de naissance soumises.",
              perms: [
                "Consulter toutes les déclarations",
                "Valider ou rejeter avec motif",
                "Attribuer le numéro d'acte officiel",
                "Accéder au tableau de bord statistiques",
              ],
              icon: (
                <svg viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
              href: "/sign-in",
              cta: "Accès officier",
            },
            {
              name: "Administrateur",
              desc: "Super-utilisateur avec accès complet à la gestion de la plateforme et des utilisateurs.",
              perms: [
                "Gérer tous les utilisateurs",
                "Traiter les demandes d'extraits",
                "Générer et délivrer les extraits PDF",
                "Supervision et rapports complets",
              ],
              icon: (
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
              ),
              href: "/sign-in",
              cta: "Accès administrateur",
            },
          ].map(({ name, desc, perms, icon, href, cta }) => (
            <div key={name} className="rn-role-card">
              <div className="rn-role-icon">{icon}</div>
              <div className="rn-role-name">{name}</div>
              <p className="rn-role-desc">{desc}</p>
              <div className="rn-role-perms">
                {perms.map((p) => (
                  <div key={p} className="rn-perm">
                    <span className="rn-perm-dot" />
                    {p}
                  </div>
                ))}
              </div>
              <Link
                href={href}
                style={{
                  display: "inline-block",
                  marginTop: "1.5rem",
                  padding: "0.6rem 1.25rem",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: "2px",
                  color: "var(--gold)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(201,168,76,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINALE ───────────────────────────────────── */}
      <section className="rn-cta">
        <h2 className="rn-cta-title">
          Prêt à digitaliser
          <br />
          votre <em>état civil</em> ?
        </h2>
        <p className="rn-cta-desc">
          Créez votre compte gratuitement et faites votre première déclaration
          de naissance en moins de 5 minutes.
        </p>
        <div className="rn-cta-actions">
          {/* CTA principal → inscription */}
          <Link href="/sign-up" className="rn-btn-primary">
            Créer un compte
          </Link>
          {/* CTA secondaire → connexion */}
          <Link href="/sign-in" className="rn-btn-outline">
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="rn-footer">
        <Link href="/" className="rn-logo">
          wa<span>ya</span>
        </Link>
        <p className="rn-footer-copy">
          Mémoire L3 — Application Web et Mobile &mdash; 2025
        </p>
        <div className="rn-footer-links">
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#processus">Processus</a>
          <a href="#roles">Rôles</a>
          <Link href="/sign-in">Connexion</Link>
        </div>
      </footer>
    </>
  );
}
