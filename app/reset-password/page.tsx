"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  // When user comes from Supabase recovery link, tokens are usually in URL hash.
  useEffect(() => {
    let alive = true;

    async function init() {
      setErr("");
      setMsg("");

      try {
        // Try to set session from URL hash if present
        const hash = window.location.hash || "";
        if (hash.includes("access_token=") && hash.includes("refresh_token=")) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;

            // Clean URL (remove tokens from address bar)
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        const { data } = await supabase.auth.getSession();
        if (!alive) return;

        if (!data?.session) {
          setErr("No recovery session found. Please open the reset link from your email again.");
          setReady(true);
          return;
        }

        setReady(true);
      } catch (e: any) {
        setErr(e?.message || "Failed to initialize recovery session");
        setReady(true);
      }
    }

    init();
    return () => {
      alive = false;
    };
  }, []);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (pw1.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw1 !== pw2) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      setMsg("✅ Password updated! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 900);
    } catch (e: any) {
      setErr(e?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, background: "#0b1020", color: "white" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Reset password</h1>
        <p style={{ marginTop: 6, opacity: 0.75 }}>Enter a new password for your account.</p>

        {!ready ? (
          <div style={{ opacity: 0.85 }}>Loading...</div>
        ) : (
          <>
            {err && <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(255,59,59,0.14)", border: "1px solid rgba(255,59,59,0.22)" }}>{err}</div>}
            {msg && <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.22)" }}>{msg}</div>}

            <form onSubmit={updatePassword} style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>New password</span>
                <input
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  type="password"
                  style={inputStyle()}
                  placeholder="Minimum 8 characters"
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Confirm new password</span>
                <input
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  type="password"
                  style={inputStyle()}
                  required
                />
              </label>

              <button
                disabled={loading}
                style={{
                  padding: "12px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(124,58,237,0.9)",
                  background: "rgba(124,58,237,0.85)",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {loading ? "..." : "Update password"}
              </button>

              <button
                type="button"
                onClick={() => router.replace("/login")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Back to login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    outline: "none",
    background: "rgba(10,12,20,0.45)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "white",
  };
}
