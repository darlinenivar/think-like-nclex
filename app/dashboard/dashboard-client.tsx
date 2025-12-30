"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type UserEmail = string | null;

export default function DashboardClient() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
  }, []);

  const [email, setEmail] = useState<UserEmail>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const userEmail = data?.user?.email ?? null;
        if (mounted) setEmail(userEmail);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>DMC</div>
          <div>
            <div style={styles.brandTitle}>Think Like NCLEX</div>
            <div style={styles.brandSub}>
              {loading ? "Loading..." : email ? email : "Guest"}
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navBtnActive}>
            Dashboard
          </Link>
          <Link href="/practice" style={styles.navBtn}>
            Practice
          </Link>
          <Link href="/planner" style={styles.navBtn}>
            Planner
          </Link>

          <button
            type="button"
            style={styles.buyBtn}
            onClick={() => alert("Buy page coming next ✅")}
          >
            Buy
          </button>

          <button type="button" style={styles.navBtn} onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.h1}>Dashboard</h1>
          <p style={styles.p}>
            This is your home base. Your progress and stats will live here.
          </p>

          <div style={styles.grid}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Accuracy</div>
              <div style={styles.statValue}>—</div>
              <div style={styles.statHint}>Coming next</div>
            </div>

            <div style={styles.stat}>
              <div style={styles.statLabel}>Questions</div>
              <div style={styles.statValue}>—</div>
              <div style={styles.statHint}>Coming next</div>
            </div>

            <div style={styles.stat}>
              <div style={styles.statLabel}>Streak</div>
              <div style={styles.statValue}>—</div>
              <div style={styles.statHint}>Coming next</div>
            </div>

            <div style={styles.stat}>
              <div style={styles.statLabel}>Last activity</div>
              <div style={styles.statValue}>—</div>
              <div style={styles.statHint}>Coming next</div>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div style={styles.nextSteps}>
            <div style={styles.nextTitle}>Next step</div>
            <div style={styles.nextText}>
              Go to <b>Practice</b> and choose mode + number of questions.
            </div>

            <div style={styles.actionsRow}>
              <Link href="/practice" style={styles.primaryBtn}>
                Start Practice
              </Link>
              <Link href="/planner" style={styles.secondaryBtn}>
                Open Planner
              </Link>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          Works on iPhone / Android / iPad / Tablet / Laptop. Optimized for fast
          loading.
        </footer>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.22) 0%, rgba(255,255,255,0) 60%), radial-gradient(1200px 700px at 80% 20%, rgba(59,130,246,0.18) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #f5f3ff 0%, #ffffff 55%, #ffffff 100%)",
    color: "#0b1220",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    padding: "14px 16px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  brandRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    minWidth: 260,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background:
      "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 100%)",
    color: "white",
    fontWeight: 800,
    display: "grid",
    placeItems: "center",
    letterSpacing: 0.5,
    boxShadow: "0 10px 24px rgba(124,58,237,0.25)",
  },

  brandTitle: {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.1,
  },

  brandSub: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    wordBreak: "break-all",
  },

  nav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  navBtn: {
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.9)",
    color: "#0b1220",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  navBtnActive: {
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(124,58,237,0.35)",
    background: "rgba(124,58,237,0.10)",
    color: "#2b175f",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },

  buyBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(124,58,237,0.35)",
    background: "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 100%)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  main: {
    padding: "18px 14px 28px",
    display: "grid",
    placeItems: "center",
  },

  card: {
    width: "min(980px, 100%)",
    borderRadius: 20,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 18px 60px rgba(2,6,23,0.10)",
    padding: 18,
  },

  h1: {
    margin: 0,
    fontSize: 28,
    letterSpacing: -0.4,
  },

  p: {
    marginTop: 8,
    marginBottom: 0,
    opacity: 0.85,
  },

  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
  },

  stat: {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
    background:
      "linear-gradient(180deg, rgba(245,243,255,0.7) 0%, rgba(255,255,255,1) 100%)",
  },

  statLabel: {
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.75,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 900,
    marginTop: 6,
  },

  statHint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },

  nextSteps: {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(255,255,255,0.92)",
  },

  nextTitle: {
    fontSize: 14,
    fontWeight: 900,
  },

  nextText: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.85,
  },

  actionsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },

  primaryBtn: {
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(124,58,237,0.25)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 100%)",
    color: "white",
    fontWeight: 900,
  },

  secondaryBtn: {
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.95)",
    color: "#0b1220",
    fontWeight: 900,
  },

  footer: {
    width: "min(980px, 100%)",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 12,
    textAlign: "center",
  },
};
