/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useRef, useEffect, useState } from "react";

function useReveal() {
  const ref = useRef(null);
  const inViewValue = useInView(ref, { once: true, margin: "-80px" });
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    setIsInView(inViewValue);
  }, [inViewValue]);
  return { ref, isInView };
}

const fadeUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};
const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function LandingClient() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [counts, setCounts] = useState({ h: 0, pct: 0, types: 0 });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  useEffect(() => {
    if (!statsInView) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        h: Math.round(ease * 72),
        pct: Math.round(ease * 100),
        types: Math.round(ease * 3),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsInView]);

  const featuresReveal = useReveal();
  const rolesReveal = useReveal();
  const ctaReveal = useReveal();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --ci-orange: #f77f00;
          --ci-orange-light: #fef3e7;
          --ci-orange-mid: #fddcb5;
          --ci-green: #009a44;
          --ci-green-dark: #006b2f;
          --ci-green-light: #e6f5ed;
          --ci-green-mid: #b3dfc5;
          --ci-white: #ffffff;
          --ci-bg: #03180b;
          --ci-bg-alt: #041f0e;
          --ci-text: #f0f7f2;
          --ci-text-muted: rgba(240,247,242,0.55);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--ci-bg);
          color: var(--ci-text);
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        /* NAV */
        .rn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 4rem;
          background: rgba(3,24,11,0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,154,68,0.2);
        }
        .rn-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700;
          color: #f77f00; letter-spacing: 0.05em; text-decoration: none;
        }
        .rn-logo span { color: var(--ci-white); }
        .rn-nav ul { display: flex; gap: 2.5rem; list-style: none; }
        .rn-nav ul a {
          color: var(--ci-text); text-decoration: none; font-size: 0.85rem;
          letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7;
          transition: opacity 0.2s, color 0.2s;
        }
        .rn-nav ul a:hover { opacity: 1; color: #f77f00; }
        .rn-nav-cta {
          background: #f77f00; color: var(--ci-white);
          padding: 0.6rem 1.6rem; border-radius: 2px;
          font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none;
          transition: background 0.2s; display: inline-block;
        }
        .rn-nav-cta:hover { background: #e06d00; }

        /* HERO */
        .rn-hero {
          min-height: 100vh; display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center; padding: 8rem 4rem 4rem;
          position: relative; overflow: hidden;
        }
        .rn-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(0,106,47,0.35) 0%, transparent 70%);
          pointer-events: none;
        }
        .rn-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,154,68,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,154,68,0.04) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .rn-hero-grid-line {
          position: absolute; top: 0; right: 0; bottom: 0; width: 50%;
          border-left: 1px solid rgba(0,154,68,0.1); pointer-events: none;
        }
        .rn-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(247,127,0,0.12); border: 1px solid rgba(247,127,0,0.35);
          padding: 0.4rem 1rem; border-radius: 100px;
          font-size: 0.75rem; letter-spacing: 0.12em;
          color: #f77f00; text-transform: uppercase; margin-bottom: 2rem;
        }
        .rn-dot {
          width: 6px; height: 6px; background: #f77f00; border-radius: 50%;
          animation: rnPulse 2s infinite;
        }
        @keyframes rnPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(247,127,0,0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(247,127,0,0); }
        }
        .rn-hero-content { position: relative; z-index: 1; }
        .rn-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 5.5rem);
          font-weight: 600; line-height: 1.05; margin-bottom: 1.5rem; color: var(--ci-white);
        }
        .rn-h1 em { color: #009a44; font-style: italic; }
        .rn-hero-desc { font-size: 1rem; line-height: 1.75; color: var(--ci-text-muted); max-width: 480px; margin-bottom: 3rem; }
        .rn-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .rn-btn-primary {
          background: #f77f00; color: var(--ci-white);
          padding: 1rem 2.5rem; border-radius: 2px; font-size: 0.85rem;
          font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: all 0.2s; border: none; cursor: pointer; display: inline-block;
        }
        .rn-btn-primary:hover { background: #e06d00; transform: translateY(-2px); }
        .rn-btn-outline {
          background: transparent; color: var(--ci-text);
          padding: 1rem 2.5rem; border-radius: 2px; font-size: 0.85rem;
          font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: all 0.2s;
          border: 1px solid rgba(0,154,68,0.35); display: inline-block;
        }
        .rn-btn-outline:hover { border-color: #009a44; color: #009a44; }

        /* DOCUMENT MOCKUP */
        .rn-hero-visual { display: flex; justify-content: center; align-items: center; position: relative; z-index: 1; }
        .rn-doc-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(0,154,68,0.25);
          border-radius: 4px; padding: 2.5rem; width: 340px; position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,154,68,0.08);
        }
        .rn-doc-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #f77f00, #009a44, transparent);
        }
        .rn-doc-card::after {
          content: ''; position: absolute; top: -100%; left: -60%;
          width: 40%; height: 300%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
          animation: cardShine 4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes cardShine { 0%, 100% { left: -60%; } 50% { left: 120%; } }
        .rn-doc-header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(0,154,68,0.15); }
        .rn-doc-crest {
          width: 48px; height: 48px; border: 2px solid #009a44; border-radius: 50%;
          margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; color: #009a44; font-family: 'Cormorant Garamond', serif; font-weight: 700;
        }
        .rn-doc-title { font-family: 'Cormorant Garamond', serif; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; color: #009a44; }
        .rn-doc-subtitle { font-size: 0.7rem; color: var(--ci-text-muted); letter-spacing: 0.08em; margin-top: 0.25rem; }
        .rn-doc-field { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 1rem; }
        .rn-doc-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #f77f00; opacity: 0.8; }
        .rn-doc-value { height: 10px; background: rgba(255,255,255,0.1); border-radius: 2px; width: 80%; animation: rnShimmer 2s infinite; }
        .rn-doc-value.short { width: 50%; }
        .rn-doc-value.medium { width: 65%; }
        @keyframes rnShimmer { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.28; } }
        .rn-doc-qr {
          position: absolute; bottom: 1.5rem; right: 1.5rem;
          width: 50px; height: 50px; border: 1px solid rgba(0,154,68,0.35);
          border-radius: 2px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; padding: 4px;
        }
        .rn-qr-cell { background: rgba(0,154,68,0.5); border-radius: 1px; }
        .rn-qr-cell:nth-child(2n+1) { opacity: 0.2; }
        .rn-qr-cell:nth-child(3n) { opacity: 0.9; }
        .rn-doc-seal {
          position: absolute; top: -15px; right: -15px;
          width: 60px; height: 60px; border: 2px solid rgba(247,127,0,0.5);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: var(--ci-bg); font-size: 0.55rem; text-align: center;
          color: #f77f00; font-weight: 500; letter-spacing: 0.05em;
          text-transform: uppercase; line-height: 1.3;
        }
        .rn-status-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(0,154,68,0.12); border: 1px solid rgba(0,154,68,0.35);
          color: #b3dfc5; padding: 0.3rem 0.75rem; border-radius: 100px;
          font-size: 0.7rem; letter-spacing: 0.06em; margin-top: 1rem;
        }
        .rn-status-dot { width: 5px; height: 5px; background: #009a44; border-radius: 50%; animation: rnPulse 2s infinite; }

        /* STATS */
        .rn-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; margin-top: 4rem; border: 1px solid rgba(0,154,68,0.15);
        }
        .rn-stat { padding: 2rem; text-align: center; background: rgba(255,255,255,0.02); transition: background 0.2s; }
        .rn-stat:hover { background: rgba(0,154,68,0.06); }
        .rn-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 600; color: #f77f00; display: block; line-height: 1; }
        .rn-stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ci-text-muted); margin-top: 0.5rem; }

        /* FEATURES */
        .rn-features { padding: 6rem 4rem; border-top: 1px solid rgba(0,154,68,0.12); }
        .rn-section-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: #f77f00; margin-bottom: 1rem; }
        .rn-section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 3.5vw, 3.5rem); font-weight: 600; line-height: 1.1; margin-bottom: 1rem; color: var(--ci-white); }
        .rn-section-title em { color: #009a44; font-style: italic; }
        .rn-features-grid { display: grid; grid-template-columns: 1fr 1.8fr; gap: 4rem; align-items: start; margin-top: 4rem; }
        .rn-feature-list { display: flex; flex-direction: column; gap: 0; }
        .rn-feature-item { padding: 1.5rem 0; border-bottom: 1px solid rgba(0,154,68,0.1); cursor: pointer; transition: padding-left 0.3s; }
        .rn-feature-item:hover { padding-left: 0.75rem; }
        .rn-feature-item-num { font-size: 0.65rem; color: #f77f00; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
        .rn-feature-item-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--ci-white); }
        .rn-feature-item-desc { font-size: 0.85rem; color: var(--ci-text-muted); line-height: 1.6; }
        .rn-process-flow { display: flex; flex-direction: column; gap: 0; }
        .rn-process-step {
          display: flex; gap: 1.5rem; align-items: flex-start; padding: 1.5rem;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(0,154,68,0.1);
          border-bottom: none; transition: background 0.2s, transform 0.2s;
        }
        .rn-process-step:last-child { border-bottom: 1px solid rgba(0,154,68,0.1); }
        .rn-process-step:hover { background: rgba(0,154,68,0.05); transform: translateX(4px); }
        .rn-step-icon {
          width: 40px; height: 40px; flex-shrink: 0;
          border: 1px solid rgba(247,127,0,0.35); border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .rn-process-step:hover .rn-step-icon { background: rgba(247,127,0,0.1); border-color: #f77f00; }
        .rn-step-icon svg { width: 18px; height: 18px; stroke: #f77f00; fill: none; stroke-width: 1.5; }
        .rn-step-info-title { font-size: 0.9rem; font-weight: 500; color: var(--ci-white); margin-bottom: 0.3rem; }
        .rn-step-info-desc { font-size: 0.8rem; color: var(--ci-text-muted); line-height: 1.5; }
        .rn-step-arrow { margin-left: auto; opacity: 0.4; font-size: 0.8rem; align-self: center; color: #009a44; transition: opacity 0.2s, transform 0.2s; }
        .rn-process-step:hover .rn-step-arrow { opacity: 1; transform: translateX(4px); }

        /* ROLES */
        .rn-roles { padding: 6rem 4rem; border-top: 1px solid rgba(0,154,68,0.12); background: rgba(0,154,68,0.02); }
        .rn-roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
        .rn-role-card {
          border: 1px solid rgba(0,154,68,0.15); padding: 2.5rem 2rem; border-radius: 2px;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden;
        }
        .rn-role-card::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 0;
          background: linear-gradient(to top, rgba(0,154,68,0.07), transparent); transition: height 0.3s;
        }
        .rn-role-card:hover { border-color: rgba(247,127,0,0.4); transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .rn-role-card:hover::before { height: 100%; }
        .rn-role-icon {
          width: 48px; height: 48px; border: 1px solid rgba(247,127,0,0.3); border-radius: 2px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .rn-role-card:hover .rn-role-icon { background: rgba(247,127,0,0.1); border-color: #f77f00; }
        .rn-role-icon svg { width: 22px; height: 22px; stroke: #f77f00; fill: none; stroke-width: 1.5; }
        .rn-role-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--ci-white); }
        .rn-role-desc { font-size: 0.82rem; color: var(--ci-text-muted); line-height: 1.65; margin-bottom: 1.5rem; }
        .rn-role-perms { display: flex; flex-direction: column; gap: 0.5rem; }
        .rn-perm { display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; color: var(--ci-text-muted); }
        .rn-perm-dot { width: 4px; height: 4px; background: #009a44; border-radius: 50%; flex-shrink: 0; }

        /* CTA */
        .rn-cta { padding: 6rem 4rem; border-top: 1px solid rgba(0,154,68,0.12); text-align: center; }
        .rn-cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 3vw, 3rem); font-weight: 600; margin-bottom: 1rem; color: var(--ci-white); }
        .rn-cta-title em { color: #009a44; font-style: italic; }
        .rn-cta-desc { font-size: 0.95rem; color: var(--ci-text-muted); max-width: 480px; margin: 0 auto 2.5rem; line-height: 1.7; }
        .rn-cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .rn-footer { padding: 3rem 4rem; border-top: 1px solid rgba(0,154,68,0.12); display: flex; align-items: center; justify-content: space-between; }
        .rn-footer-copy { font-size: 0.75rem; color: var(--ci-text-muted); }
        .rn-footer-links { display: flex; gap: 2rem; }
        .rn-footer-links a { font-size: 0.75rem; color: var(--ci-text-muted); text-decoration: none; transition: color 0.2s; }
        .rn-footer-links a:hover { color: #f77f00; }

        /* ═══════════════════════════════════════════════
           MOBILE — animations et layout spécifiques
        ═══════════════════════════════════════════════ */
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

          /* Badge hero — bounce d'entrée */
          .rn-hero-badge {
            animation: mobileBadgeBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          @keyframes mobileBadgeBounce {
            from { opacity: 0; transform: translateY(-20px) scale(0.85); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* Dot — pulsation plus prononcée sur mobile */
          .rn-dot {
            animation: mobileDotPulse 1.2s infinite;
          }
          @keyframes mobileDotPulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(247,127,0,0.6); transform: scale(1); }
            50% { opacity: 0.7; box-shadow: 0 0 0 10px rgba(247,127,0,0); transform: scale(1.3); }
          }

          /* Stats — entrée avec rebond + couleur flash */
          .rn-stat {
            border-left: 3px solid #f77f00;
            animation: mobileStatSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          .rn-stat:nth-child(1) { animation-delay: 0.1s; }
          .rn-stat:nth-child(2) { animation-delay: 0.2s; border-left-color: #009a44; }
          .rn-stat:nth-child(3) { animation-delay: 0.3s; border-left-color: #b3dfc5; }
          @keyframes mobileStatSlide {
            from { opacity: 0; transform: translateX(-30px); }
            to   { opacity: 1; transform: translateX(0); }
          }

          /* Numéros stats — plus grands sur mobile */
          .rn-stat-num { font-size: 3rem; }

          /* Boutons CTA — vibration au tap */
          .rn-btn-primary {
            width: 100%;
            text-align: center;
            animation: mobileGlow 2s ease-in-out infinite;
          }
          @keyframes mobileGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(247,127,0,0); }
            50% { box-shadow: 0 0 20px 4px rgba(247,127,0,0.35); }
          }
          .rn-btn-outline { width: 100%; text-align: center; }

          /* Feature items — highlight orange au scroll */
          .rn-feature-item {
            border-left: 3px solid transparent;
            padding-left: 1rem;
            transition: border-color 0.3s, background 0.3s;
            animation: mobileFeatureIn 0.5s ease both;
          }
          .rn-feature-item:nth-child(1) { animation-delay: 0.05s; }
          .rn-feature-item:nth-child(2) { animation-delay: 0.15s; }
          .rn-feature-item:nth-child(3) { animation-delay: 0.25s; }
          .rn-feature-item:nth-child(4) { animation-delay: 0.35s; }
          @keyframes mobileFeatureIn {
            from { opacity: 0; transform: translateX(-24px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .rn-feature-item:active { border-left-color: #f77f00; background: rgba(247,127,0,0.05); }

          /* Process steps — entrée depuis la droite + tap feedback */
          .rn-process-step {
            animation: mobileStepIn 0.5s ease both;
            transition: background 0.2s, transform 0.15s;
          }
          .rn-process-step:nth-child(1) { animation-delay: 0.05s; }
          .rn-process-step:nth-child(2) { animation-delay: 0.12s; }
          .rn-process-step:nth-child(3) { animation-delay: 0.19s; }
          .rn-process-step:nth-child(4) { animation-delay: 0.26s; }
          .rn-process-step:nth-child(5) { animation-delay: 0.33s; }
          @keyframes mobileStepIn {
            from { opacity: 0; transform: translateX(30px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .rn-process-step:active { background: rgba(0,154,68,0.08); transform: scale(0.98); }

          /* Icône step — animation continue sur mobile */
          .rn-step-icon {
            animation: mobileIconFloat 3s ease-in-out infinite;
          }
          .rn-process-step:nth-child(2) .rn-step-icon { animation-delay: 0.6s; }
          .rn-process-step:nth-child(3) .rn-step-icon { animation-delay: 1.2s; }
          .rn-process-step:nth-child(4) .rn-step-icon { animation-delay: 1.8s; }
          .rn-process-step:nth-child(5) .rn-step-icon { animation-delay: 2.4s; }
          @keyframes mobileIconFloat {
            0%, 100% { transform: translateY(0); border-color: rgba(247,127,0,0.35); }
            50% { transform: translateY(-4px); border-color: #f77f00; background: rgba(247,127,0,0.08); }
          }

          /* Role cards — entrée scale + tap feedback */
          .rn-role-card {
            animation: mobileCardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            position: relative;
          }
          .rn-role-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #f77f00, #009a44);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
          }
          .rn-role-card:active { transform: scale(0.97); }
          .rn-role-card:active::after { transform: scaleX(1); }
          .rn-role-card:nth-child(1) { animation-delay: 0.05s; }
          .rn-role-card:nth-child(2) { animation-delay: 0.15s; }
          .rn-role-card:nth-child(3) { animation-delay: 0.25s; }
          @keyframes mobileCardIn {
            from { opacity: 0; transform: scale(0.88) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }

          /* Perm dots — animation en cascade */
          .rn-perm-dot {
            animation: mobilePermPulse 2s ease-in-out infinite;
          }
          .rn-perm:nth-child(1) .rn-perm-dot { animation-delay: 0s; }
          .rn-perm:nth-child(2) .rn-perm-dot { animation-delay: 0.5s; }
          .rn-perm:nth-child(3) .rn-perm-dot { animation-delay: 1s; }
          .rn-perm:nth-child(4) .rn-perm-dot { animation-delay: 1.5s; }
          @keyframes mobilePermPulse {
            0%, 100% { transform: scale(1); background: #009a44; }
            50% { transform: scale(1.8); background: #f77f00; }
          }

          /* Section labels — slide depuis la gauche */
          .rn-section-label {
            animation: mobileLabelIn 0.5s ease both;
            border-left: 2px solid #f77f00;
            padding-left: 0.75rem;
          }
          @keyframes mobileLabelIn {
            from { opacity: 0; transform: translateX(-16px); }
            to   { opacity: 1; transform: translateX(0); }
          }

          /* CTA section — fond animé */
          .rn-cta {
            background: linear-gradient(180deg, transparent, rgba(0,154,68,0.04));
            animation: mobileCtaBg 4s ease-in-out infinite;
          }
          @keyframes mobileCtaBg {
            0%, 100% { background: linear-gradient(180deg, transparent, rgba(0,154,68,0.04)); }
            50% { background: linear-gradient(180deg, transparent, rgba(247,127,0,0.04)); }
          }

          /* Titre CTA — pulsation légère */
          .rn-cta-title {
            animation: mobileCtaTitlePulse 3s ease-in-out infinite;
          }
          @keyframes mobileCtaTitlePulse {
            0%, 100% { text-shadow: none; }
            50% { text-shadow: 0 0 30px rgba(0,154,68,0.3); }
          }

          /* Nav CTA — glow sur mobile */
          .rn-nav-cta {
            animation: mobileNavGlow 2.5s ease-in-out infinite;
          }
          @keyframes mobileNavGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(247,127,0,0); }
            50% { box-shadow: 0 0 12px 2px rgba(247,127,0,0.4); }
          }

          /* Grille de fond — plus visible sur mobile */
          .rn-grid-bg {
            background-size: 40px 40px;
            opacity: 1.5;
          }
        }
      `}</style>

      {/* ── NAV ── */}
      <motion.nav
        className="rn-nav"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
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
        <Link href="/sign-in" className="rn-nav-cta">
          Se connecter
        </Link>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="rn-hero" ref={heroRef}>
        <div className="rn-grid-bg" />
        <div className="rn-hero-grid-line" />

        <motion.div
          className="rn-hero-content"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            className="rn-hero-badge"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="rn-dot" />
            Mémoire L3 — Digitalisation de l&apos;état civil
          </motion.div>

          <motion.h1
            className="rn-h1"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {[
              "L'extrait de",
              "naissance à l'ère",
              <>
                <em key="em">numérique</em>
              </>,
            ].map((line, i) => (
              <motion.span
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "block" }}
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="rn-hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Une plateforme moderne qui digitalise entièrement le processus de
            déclaration, de validation et de délivrance des extraits de
            naissance, de la maternité au citoyen.
          </motion.p>

          <motion.div
            className="rn-hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link href="/sign-up" className="rn-btn-primary">
              Faire une demande
            </Link>
            <a href="#processus" className="rn-btn-outline">
              Voir le processus
            </a>
          </motion.div>

          <motion.div
            className="rn-stats"
            ref={statsRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="rn-stat">
              <span className="rn-stat-num">{counts.h}h</span>
              <span className="rn-stat-label">Délai de délivrance</span>
            </div>
            <div className="rn-stat">
              <span className="rn-stat-num">{counts.pct}%</span>
              <span className="rn-stat-label">Traitement en ligne</span>
            </div>
            <div className="rn-stat">
              <span className="rn-stat-num">{counts.types}</span>
              <span className="rn-stat-label">Types d&apos;extraits</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="rn-hero-visual"
          initial={{ opacity: 0, x: 60, rotateY: 15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            style={{ position: "relative" }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
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
              ].map(({ label, cls }, i) => (
                <motion.div
                  key={label}
                  className="rn-doc-field"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                >
                  <span className="rn-doc-label">{label}</span>
                  <div className={`rn-doc-value ${cls}`} />
                </motion.div>
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
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className="rn-features"
        id="fonctionnalites"
        ref={featuresReveal.ref}
      >
        <motion.p
          className="rn-section-label"
          variants={fadeIn}
          initial="hidden"
          animate={featuresReveal.isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5 }}
        >
          Fonctionnalités
        </motion.p>
        <motion.h2
          className="rn-section-title"
          variants={fadeUp}
          initial="hidden"
          animate={featuresReveal.isInView ? "visible" : "hidden"}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Tout le processus,
          <br />
          <em>repensé</em> numériquement
        </motion.h2>

        <div className="rn-features-grid">
          <motion.div
            className="rn-feature-list"
            variants={{
              ...stagger,
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            animate={featuresReveal.isInView ? "visible" : "hidden"}
          >
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
              <motion.div
                key={num}
                className="rn-feature-item"
                variants={slideLeft}
                transition={{ duration: 0.5 }}
              >
                <div className="rn-feature-item-num">{num}</div>
                <div className="rn-feature-item-title">{title}</div>
                <p className="rn-feature-item-desc">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="rn-process-flow"
            id="processus"
            variants={{
              ...stagger,
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            animate={featuresReveal.isInView ? "visible" : "hidden"}
          >
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
              <motion.div
                key={title}
                className="rn-process-step"
                variants={slideRight}
                transition={{ duration: 0.5 }}
              >
                <div className="rn-step-icon">{icon}</div>
                <div className="rn-step-info">
                  <div className="rn-step-info-title">{title}</div>
                  <div className="rn-step-info-desc">{desc}</div>
                </div>
                <span className="rn-step-arrow">→</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="rn-roles" id="roles" ref={rolesReveal.ref}>
        <motion.p
          className="rn-section-label"
          variants={fadeIn}
          initial="hidden"
          animate={rolesReveal.isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5 }}
        >
          Gestion des accès
        </motion.p>
        <motion.h2
          className="rn-section-title"
          variants={fadeUp}
          initial="hidden"
          animate={rolesReveal.isInView ? "visible" : "hidden"}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Trois profils,
          <br />
          <em>une</em> plateforme
        </motion.h2>

        <motion.div
          className="rn-roles-grid"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          animate={rolesReveal.isInView ? "visible" : "hidden"}
        >
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
            <motion.div
              key={name}
              className="rn-role-card"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div className="rn-role-icon">{icon}</div>
              <div className="rn-role-name">{name}</div>
              <p className="rn-role-desc">{desc}</p>
              <div className="rn-role-perms">
                {perms.map((p, i) => (
                  <motion.div
                    key={p}
                    className="rn-perm"
                    initial={{ opacity: 0, x: -8 }}
                    animate={rolesReveal.isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                  >
                    <span className="rn-perm-dot" />
                    {p}
                  </motion.div>
                ))}
              </div>
              <Link
                href={href}
                style={{
                  display: "inline-block",
                  marginTop: "1.5rem",
                  padding: "0.6rem 1.25rem",
                  border: "1px solid rgba(247,127,0,0.4)",
                  borderRadius: "2px",
                  color: "#f77f00",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(247,127,0,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {cta} →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="rn-cta" ref={ctaReveal.ref}>
        <motion.div
          variants={{
            ...stagger,
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          initial="hidden"
          animate={ctaReveal.isInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="rn-cta-title"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
          >
            Prêt à digitaliser
            <br />
            votre <em>état civil</em> ?
          </motion.h2>
          <motion.p
            className="rn-cta-desc"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            Créez votre compte gratuitement et faites votre première déclaration
            de naissance en moins de 5 minutes.
          </motion.p>
          <motion.div
            className="rn-cta-actions"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <Link href="/sign-up" className="rn-btn-primary">
              Créer un compte
            </Link>
            <Link href="/sign-in" className="rn-btn-outline">
              J&apos;ai déjà un compte
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
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
