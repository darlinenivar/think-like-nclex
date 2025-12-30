"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Think Like NCLEX</h2>

        <label>Username (Email)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="remember">
          <input type="checkbox" /> Remember my username (email)
        </label>

        <button className="btn-primary">Login</button>

        <div className="actions">
          <button
            className="btn-link"
            onClick={() => router.push("/reset-password")}
          >
            Forgot password?
          </button>

          <button
            className="btn-outline"
            onClick={() => router.push("/register")}
          >
            Create account
          </button>
        </div>

        <div className="actions">
          <button
            className="btn-buy"
            onClick={() => router.push("/buy")}
          >
            Buy
          </button>

          <button
            className="btn-demo"
            onClick={() => router.push("/register?demo=true")}
          >
            Demo (50 FREE)
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            rgba(80, 50, 150, 0.75),
            rgba(80, 50, 150, 0.75)
          ),
          url("/nurse-bg.jpg") center / cover no-repeat;
        }

        .login-card {
          width: 380px;
          padding: 28px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(14px);
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,.25);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        label {
          font-size: 14px;
          margin-top: 10px;
          display: block;
        }

        input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          margin-top: 4px;
        }

        .remember {
          margin: 10px 0;
          font-size: 13px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: #6c5ce7;
          color: white;
          font-weight: 600;
          margin-top: 10px;
          cursor: pointer;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .btn-link {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 13px;
          opacity: 0.9;
        }

        .btn-outline {
          border: 1px solid white;
          background: transparent;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-buy {
          background: #7b5cff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 20px;
          cursor: pointer;
        }

        .btn-demo {
          background: transparent;
          border: 1px solid white;
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
