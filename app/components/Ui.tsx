"use client";

import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardPad({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card card-pad ${className}`}>{children}</div>;
}

export function Button({
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "accent" | "danger" }) {
  const cls =
    variant === "primary"
      ? "btn btn-primary"
      : variant === "accent"
      ? "btn btn-accent"
      : variant === "danger"
      ? "btn btn-danger"
      : "btn";

  return (
    <button {...props} className={cls}>
      {children}
    </button>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className || ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`select ${props.className || ""}`} />;
}

export function Toast({ kind = "ok", children }: { kind?: "ok" | "err"; children: React.ReactNode }) {
  return <div className={`toast ${kind}`}>{children}</div>;
}

export function Progress({ valuePct }: { valuePct: number }) {
  const w = Math.max(0, Math.min(100, Math.round(valuePct)));
  return (
    <div className="progress" aria-label="progress">
      <div style={{ width: `${w}%` }} />
    </div>
  );
}
