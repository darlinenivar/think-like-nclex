"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Stat = { label: string; value: string; sub: string };

export default function DashboardClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  // Si ya guardas el email en localStorage, esto lo muestra.
  // Si no, no pasa nada: solo saldrá vacío.
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email") ||
        "";
      if (stored) setEmail(stored);
    } catch {}
  }, []);

  const stats: Stat[] = useMemo(
    () => [
      { label: "ACCURACY", value: "—", sub: "Coming next" },
      { label: "QUESTIONS", value: "—", sub: "Coming next" },
      { label: "STREAK", value: "—", sub: "Coming next" },
      { label: "LAST ACTIVITY", value: "—", sub: "Coming next" },
    ],
    []
  );

  return (
    <div className="page">
      {/* Fondo con movimiento suave */}
      <div className="bg">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grain" />
      </div>

      {/* Header */}
      <header className="topbar">
        <div className="brand" onClick={() => router.push("/dashboard")}>
          <div className="logo">DMC</div>
          <div className="brandText">
            <div className="title">Think Like NCLEX</div>
            <div className="subtitle">{email || " "}</div>
          </div>
        </div>

        <nav className="nav">
          <button className="pill active" onClick={() => router.push("/dashboard")}>
            Dashboard
          </button>
          <button className="pill" onClick={() => router.push("/practice")}>
            Practice
          </button>
          <button className="pill" onClick={() => router.push("/planner")}>
            Planner
          </button>

          <button className="cta" onClick={() => router.push("/buy")}>
            Buy
          </button>

          <button className="ghost" onClick={() => router.push("/login")}>
            Log out
          </button>
        </nav>
      </header>

      {/* Contenido */}
      <main className="wrap">
        <section className="card">
          <h1 className="h1">Dashboard</h1>
          <p className="p">
            This is your home base. Your progress and stats will live here.
          </p>

          <div className="grid">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="statLabel">{s.label}</div>
                <div className="statValue">{s.value}</div>
                <div className="statSub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="next">
            <div className="nextTitle">Next step</div>
            <div className="nextText">
              Go to <b>Practice</b> and choose mode + number of questions.
            </div>

            <div className="actions">
              <button className="primary" onClick={() => router.push("/practice")}>
                Start Practice
              </button>
              <button className="secondary" onClick={() => router.push("/planner")}>
                Open Planner
              </button>
            </div>
          </div>

          <div className="footerNote">
            Works on iPhone / Android / iPad / Tablet / Laptop. Optimized for fast
            loading.
          </div>
        </section>
      </main>

      {/* Estilos (no tienes que tocar globals.css) */}
      <style jsx global>{`
        :root {
          --bg1: #0b0f24;
          --bg2: #120a2a;
          --ink: rgba(255, 255, 255, 0.92);
          --muted: rgba(255, 255, 255, 0.7);
          --soft: rgba(255, 255, 255, 0.12);
          --soft2: rgba(255, 255, 255, 0.08);
          --border: rgba(255, 255, 255, 0.14);
          --accent: #7c3aed; /* morado */
          --accent2: #4f46e5; /* índigo */
        }

        html,
        body {
          height: 100%;
        }

        .page {
          min-height: 100vh;
          color: var(--ink);
          position: relative;
          overflow: hidden;
          background: radial-gradient(1200px 600px at 20% 10%, #2a1b5a 0%, transparent 60%),
            radial-gradient(1000px 700px at 80% 30%, #1b2a6a 0%, transparent 60%),
            linear-gradient(180deg, var(--bg1), var(--bg2));
        }

        .bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 999px;
          filter: blur(55px);
          opacity: 0.55;
          animation: floaty 12s ease-in-out infinite;
        }

        .b1 {
          left: -120px;
          top: 120px;
          background: radial-gradient(circle at 30% 30%, var(--accent), transparent 60%);
          animation-delay: 0s;
        }

        .b2 {
          right: -140px;
          top: 40px;
          background: radial-gradient(circle at 30% 30%, var(--accent2), transparent 60%);
          animation-delay: 2s;
        }

        @keyframes floaty {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(40px, -18px, 0) scale(1.04);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .logo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 800;
          letter-spacing: 0.5px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
        }

        .brandText .title {
          font-size: 16px;
          font-weight: 800;
          line-height: 1.1;
        }

        .brandText .subtitle {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pill,
        .cta,
        .ghost {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.08);
          color: var(--ink);
          padding: 10px 14px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.08s ease, background 0.2s ease;
          backdrop-filter: blur(12px);
        }

        .pill:hover,
        .ghost:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .pill.active {
          background: rgba(255, 255, 255, 0.16);
        }

        .cta {
          border: 1px solid rgba(124, 58, 237, 0.55);
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(79, 70, 229, 0.9));
        }

        .cta:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .ghost {
          background: transparent;
        }

        .wrap {
          padding: 18px 18px 40px;
          display: flex;
          justify-content: center;
        }

        .card {
          width: min(980px, 100%);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 22px;
          backdrop-filter: blur(14px);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
        }

        .h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.5px;
        }

        .p {
          margin: 10px 0 16px;
          color: var(--muted);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .stat {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 14px;
          min-height: 86px;
        }

        .statLabel {
          font-size: 12px;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.65);
          font-weight: 800;
        }

        .statValue {
          font-size: 22px;
          font-weight: 900;
          margin-top: 8px;
        }

        .statSub {
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
        }

        .next {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .nextTitle {
          font-weight: 900;
          margin-bottom: 6px;
        }

        .nextText {
          color: rgba(255, 255, 255, 0.78);
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .primary,
        .secondary {
          border: 1px solid var(--border);
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.08s ease, filter 0.2s ease;
        }

        .primary {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(79, 70, 229, 0.9));
          border-color: rgba(124, 58, 237, 0.55);
          color: white;
        }

        .secondary {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .primary:hover,
        .secondary:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .footerNote {
          margin-top: 16px;
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 860px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .grid {
            grid-template-columns: 1fr;
          }
          .h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
