"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function boot() {
      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error || !data?.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email || "");
      setLoading(false);
    }

    boot();
    return () => {
      alive = false;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "white" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 18, color: "white" }}>
      {/* MENU ARRIBA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.10)",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            DMC
          </div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Think Like NCLEX</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ opacity: 0.85, fontSize: 13 }}>{email}</div>

          <button
            onClick={() => router.push("/practice")}
            style={btn()}
          >
            Practice
          </button>

          <button
            onClick={() => router.push("/planner")}
            style={btn()}
          >
            Planner
          </button>

          <button
            onClick={() => router.push("/pricing")}
            style={btnPrimary()}
          >
            Buy
          </button>

          <button
            onClick={logout}
            style={btnGhost()}
          >
            Log out
          </button>
        </div>
      </div>

      {/* DASHBOARD ABAJO */}
      <div style={{ marginTop: 16 }}>
        <h1 style={{ margin: "8px 0 6px", fontSize: 28, fontWeight: 950 }}>Dashboard</h1>
        <p style={{ margin: 0, opacity: 0.78 }}>
          This is your home screen after login ✅
        </p>

        {/* Aquí luego pegamos TU dashboard real */}
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Next step</div>
          <div style={{ opacity: 0.85 }}>
            If you want, I can move your existing dashboard widgets here and make it match the new style.
          </div>
        </div>
      </div>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  };
}
function btnGhost(): React.CSSProperties {
  return {
    ...btn(),
    background: "rgba(255,255,255,0.06)",
  };
}
function btnPrimary(): React.CSSProperties {
  return {
    ...btn(),
    background: "rgba(124, 58, 237, 0.80)",
    border: "1px solid rgba(124, 58, 237, 0.95)",
  };
}
