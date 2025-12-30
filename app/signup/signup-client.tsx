"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setMsg("Please enter email and password.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      // Si tu Supabase requiere confirmación por email, aquí te avisará
      // Si no, te crea la sesión y puedes redirigir
      if (data.session) {
        router.push(next);
      } else {
        setMsg("Check your email to confirm your account, then login.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  function backToLogin() {
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="page">
      <div className="overlay" />

      <div className="card">
        <div className="title">Create account</div>
        <div className="sub">Think Like NCLEX</div>

        <form onSubmit={onSignup}>
          <label className="label">Email</label>
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
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
          />

          {msg ? <div className="msg">{msg}</div> : null}

          <button className="btnPrimary" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create account"}
          </button>

          <button type="button" className="btnGhost" onClick={backToLogin}>
            Back to login
          </button>
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
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.55),
            rgba(37, 99, 235, 0.35),
            rgba(0, 0, 0, 0.25)
          );
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
        .title {
          font-size: 22px;
          font-weight: 800;
        }
        .sub {
          font-size: 13px;
          opacity: 0.85;
          margin-top: 4px;
        }
        .label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
          margin: 12px 0 6px;
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
        .msg {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 13px;
        }
        .btnPrimary {
          margin-top: 14px;
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
        .btnGhost {
          margin-top: 10px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          cursor: pointer;
          padding: 10px 6px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
