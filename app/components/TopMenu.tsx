"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TopMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string>("");

  // Ocultar menú en login (para que el primer “después de login” sea menú + dashboard)
  if (pathname === "/login") return null;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? "");
    })();
  }, [pathname]);

  const linkStyle = (href: string) => ({
    textDecoration: "none",
    fontWeight: pathname === href ? 900 : 700,
    opacity: pathname === href ? 1 : 0.85,
    color: "inherit",
  });

  return (
    <div style={{ borderBottom: "1px solid #e5e5e5", background: "white", position: "sticky", top: 0, zIndex: 50 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 900 }}>Think Like NCLEX</span>
          <a href="/dashboard" style={linkStyle("/dashboard")}>Dashboard</a>
          <a href="/practice" style={linkStyle("/practice")}>Tutor / CAT</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {email ? <span style={{ fontSize: 12, opacity: 0.8 }}>{email}</span> : null}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
