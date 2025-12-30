"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot";

const LS_EMAIL = "tln_email_hint_v1";
const LS_REMEMBER = "tln_remember_email_v1";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberEmail, setRememberEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const rem = localStorage.getItem(LS_REMEMBER);
      const remBool = rem === null ? true : rem === "1";
      setRememberEmail(remBool);

      const saved = localStorage.getItem(LS_EMAIL);
      if (remBool && saved) setEmail(saved);
    } catch {}
  }, []);

  function clearAlerts() {
    setMsg("");
    setErr("");
  }

  function persistEmailHint(nextEmail: string) {
    try {
      localStorage.setItem(LS_REMEMBER, rememberEmail ? "1" : "0");
      if (rememberEmail) localStorage.setItem(LS_EMAIL, nextEmail);
      else localStorage.removeItem(LS_EMAIL);
    } catch {}
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      persistEmailHint(email);
      router.replace("/dashboard");
    } catch (ex: any) {
      setErr(ex?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    setLoading(true);
    try {
      // ✅ Direct to reset-password page
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;

      persistEmailHint(email);
      setMsg("✅ Password reset email sent. Check Gmail Inbox/Spam/Promotions.");
    } catch (ex: any) {
      setErr(ex?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <div className="bg" aria-hidden="true">
        <Image src="/auth/login-mobile-800x1200.webp" alt="" fill priority sizes="100vw" className="bgImg bgMobile" />
        <Image src="/auth/login-desktop-1200x800.webp" alt="" fill priority sizes="100vw" className="bgImg bgDesktop" />
        <div className="light" />
        <div className="vignette" />
      </div>

      <section className="card">
        <div className="head">
          <div>
            <div className="title">Think Like NCLEX</div>
            <div className="sub">{mode === "login" ? "Login" : "Reset password"}</div>
          </div>
          <div className="pill">DMC</div>
        </div>

        {err && <div className="toast err">{err}</div>}
        {msg && <div className="toast ok">{msg}</div>}

        {mode === "login" ? (
          <form className="form" onSubmit={handleLogin}>
            <label className="label">
              <span>Username (Email)</span>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>

            <label className="label">
              <span>Password</span>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>

            <label className="remember">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              <span>Remember my username (email)</span>
            </label>

            <button className="btnWide" disabled={loading}>
              {loading ? "..." : "Login"}
            </button>

            <div className="row">
              <button type="button" className="btnGhost" onClick={() => (clearAlerts(), setMode("forgot"))}>
                Forgot password?
              </button>
              <button type="button" className="btnGhost" onClick={() => router.push("/pricing")}>
                Buy
              </button>
              <button type="button" className="btnGhost" onClick={() => router.push("/practice?menu=fundamentals&fund=Fundamentals&count=50&start=1")}>
                Demo (50 FREE)
              </button>
            </div>
          </form>
        ) : (
          <form className="form" onSubmit={handleForgot}>
            <label className="label">
              <span>Email</span>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>

            <button className="btnWide" disabled={loading}>
              {loading ? "..." : "Send reset link"}
            </button>

            <div className="row">
              <button type="button" className="btnGhost" onClick={() => (clearAlerts(), setMode("login"))}>
                Back to login
              </button>
            </div>

            <div className="tiny">
              Gmail tip: check <b>Spam</b> and <b>Promotions</b>. Search: <b>reset</b> or <b>supabase</b>.
            </div>
          </form>
        )}
      </section>

      <style jsx>{`
        .shell { position: relative; min-height: 100vh; overflow: hidden; display: grid; place-items: center; padding: 16px; }
        .bg { position: absolute; inset: 0; z-index: 0; }
        .bgImg { object-fit: cover; transform: scale(1.03); }
        .bgMobile { display: block; }
        .bgDesktop { display: none; }
        .light {
          position: absolute; inset: -25%;
          background:
            radial-gradient(circle at 30% 30%, rgba(124,58,237,.35), transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(59,130,246,.22), transparent 55%);
          filter: blur(12px);
          animation: drift 10s ease-in-out infinite alternate;
        }
        @keyframes drift { from { transform: translate(-1.5%,-1%) scale(1.02);} to { transform: translate(1.5%,1%) scale(1.04);} }
        .vignette { position: absolute; inset: 0; background: radial-gradient(circle at 50% 40%, rgba(0,0,0,.10), rgba(0,0,0,.55)); }
        .card {
          position: relative; z-index: 1; width: 100%; max-width: 560px;
          padding: 18px; border-radius: 22px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          color: rgba(255,255,255,0.92);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .head { display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; margin-bottom: 10px; }
        .title { font-weight: 950; font-size: 20px; }
        .sub { font-size: 13px; opacity: .75; }
        .pill {
          padding: 6px 10px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.10);
          font-weight: 900; letter-spacing: .08em;
          height: fit-content;
        }
        .form { display:grid; gap: 12px; margin-top: 8px; }
        .label { display:grid; gap: 6px; }
        .label span { font-size: 12px; opacity: .78; }
        .input {
          width: 100%; border-radius: 12px; padding: 12px;
          background: rgba(10,12,20,0.45);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.95);
          outline: none;
        }
        .input:focus { border-color: rgba(124,58,237,0.7); box-shadow: 0 0 0 4px rgba(124,58,237,0.18); }
        .remember { display:flex; gap: 10px; align-items:center; font-weight: 800; opacity: .85; }
        .btnWide {
          width: 100%; padding: 12px 14px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.12);
          color: white; font-weight: 900; cursor: pointer;
        }
        .row { display:flex; gap: 10px; justify-content:center; flex-wrap: wrap; }
        .btnGhost {
          padding: 10px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: white; font-weight: 800; cursor: pointer;
        }
        .toast { padding: 10px 12px; border-radius: 12px; font-size: 13px; margin-top: 8px; }
        .toast.err { background: rgba(255,59,59,0.14); border: 1px solid rgba(255,59,59,0.22); }
        .toast.ok  { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.22); }
        .tiny { text-align:center; font-size: 11px; opacity: .75; margin-top: 8px; }

        @media (min-width: 900px) {
          .bgMobile { display:none; }
          .bgDesktop { display:block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .light { animation: none; }
        }
      `}</style>
    </main>
  );
}
