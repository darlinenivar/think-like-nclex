"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // destino después de login (si viene ?next=...)
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) setEmail(saved);
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setMsg("Please enter email and password.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      if (remember) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");

      // si todo ok
      router.push(next);
    } finally {
      setLoading(false);
    }
  }

  function goSignup() {
    // si venía un next, lo pasamos a signup también
    router.push(`/signup?next=${encodeURIComponent(next)}`);
  }

  function goForgot() {
    router.push("/reset-password");
  }

  function goBuy() {
    // ajusta si tienes otra ruta de compra
    router.push("/buy");
  }

  async function goDemo() {
    setMsg(null);

    // Demo: si NO tiene sesión -> signup
    // si TIENE sesión -> practice demo
    const { data } = await supabase.auth.getSession();
    const hasSession = !!data.session;

    const demoTarget = "/practice?mode=demo&count=50";

    if (!hasSession) {
      router.push(`/signup?next=${encodeURIComponent(demoTarget)}`);
      return;
    }

    router.push(demoTarget);
  }

  return (
    <div className="page">
      <div className="overlay" />

      <div className="card" role="dialog" aria-label="Login">
        <div className="brandRow">
          <div className="brandTitle">
            <div className="title">Think Like NCLEX</div>
            <div className="subtitle">Login</div>
          </div>
          <span className="badge">DMC</span>
        </div>

        <form onSubmit={onLogin} className="form">
          <label className="label">Username (Email)</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />

          <label className="label">Password</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />

          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember my username (email)</span>
          </label>

          {msg ? <div className="msg">{msg}</div> : null}

          <button className="btnPrimary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="row2">
            <button type="button" className="btnGhost" onClick={goForgot}>
              Forgot password?
            </button>

            <button type="button" className="btnOutline" onClick={goSignup}>
              Create account
            </button>
          </div>

          <div className="row3">
            <button type="button" className="btnBuy" onClick={goBuy}>
              Buy
            </button>

            <button type="button" className="btnDemo" onClick={goDemo}>
              Demo
            </button>
          </div>

          <div className="foot">
            Study smarter • Bilingual • Works on iPhone / Android / iPad / Laptop
          </div>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          display: grid;
          place-items: center;
          padding: 24px;
          background: url("/login-bg.jpg") center/cover no-repeat;
        }
        /* si tu imagen no se llama login-bg.jpg,
           ponla en /public/login-bg.jpg o cambia el nombre arriba */

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.55),
            rgba(37, 99, 235, 0.35),
            rgba(0, 0, 0, 0.25)
          );
          backdrop-filter: blur(1px);
        }

        .card {
          position: relative;
          width: min(520px, 92vw);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
          padding: 20px;
          color: rgba(255, 255, 255, 0.95);
        }

        .brandRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }
        .subtitle {
          font-size: 13px;
          opacity: 0.85;
          margin-top: 2px;
        }
        .badge {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .form {
          margin-top: 8px;
        }
        .label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
          margin: 10px 0 6px;
        }
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.92);
          padding: 12px 12px;
          outline: none;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.55);
        }

        .remember {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 10px 0 6px;
          font-size: 12px;
          opacity: 0.95;
        }
        .msg {
          margin: 10px 0 0;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.95);
        }

        .btnPrimary {
          margin-top: 12px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, rgb(99, 102, 241), rgb(124, 58, 237));
          cursor: pointer;
        }
        .btnPrimary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .row2 {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          margin-top: 10px;
        }
        .btnGhost {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          cursor: pointer;
          padding: 10px 6px;
        }
        .btnOutline {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .row3 {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          margin-top: 10px;
        }
        .btnBuy {
          border: none;
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 800;
          color: white;
          background: rgba(99, 102, 241, 0.85);
          cursor: pointer;
        }
        .btnDemo {
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 800;
          color: white;
          background: rgba(0, 0, 0, 0.22);
          cursor: pointer;
        }

        .foot {
          margin-top: 12px;
          text-align: center;
          font-size: 12px;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
