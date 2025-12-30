"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

type Plan = {
  id: string;
  title: string;
  duration_days: number;
  starts_on: string;
  ends_on: string;
};

type Session = {
  id: string;
  plan_id: string;
  session_date: string;
  target_questions: number;
  completed_questions: number;
  notes: string | null;
};

const DURATIONS = [
  { days: 15, label: "15 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "3 meses" },
  { days: 180, label: "6 meses" },
  { days: 365, label: "1 año" },
];

function addDays(dateISO: string, days: number) {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + (days - 1));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>("");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [title, setTitle] = useState("NCLEX Study Plan");
  const [duration, setDuration] = useState(30);
  const [startsOn, setStartsOn] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      await refreshPlans();
      setLoading(false);
    })();
  }, [router]);

  async function refreshPlans() {
    const user = (await supabase.auth.getUser()).data.user!;
    const res = await supabase
      .from("study_plans")
      .select("id,title,duration_days,starts_on,ends_on")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const list = (res.data ?? []) as Plan[];
    setPlans(list);

    const pick = activePlanId || list[0]?.id || "";
    setActivePlanId(pick);
    if (pick) await refreshSessions(pick);
    else setSessions([]);
  }

  async function refreshSessions(planId: string) {
    const res = await supabase
      .from("study_sessions")
      .select("id,plan_id,session_date,target_questions,completed_questions,notes")
      .eq("plan_id", planId)
      .order("session_date", { ascending: true });

    setSessions((res.data ?? []) as Session[]);
  }

  async function createPlan() {
    const user = (await supabase.auth.getUser()).data.user!;
    const ends = addDays(startsOn, duration);

    const res = await supabase.from("study_plans").insert({
      user_id: user.id,
      title,
      duration_days: duration,
      starts_on: startsOn,
      ends_on: ends,
      preferences: {},
    } as any);

    if (!res.error) {
      await refreshPlans();
    }
  }

  async function generateSessions() {
    if (!activePlanId) return;
    const p = plans.find((x) => x.id === activePlanId);
    if (!p) return;

    // Create one session per day
    const start = new Date(p.starts_on + "T00:00:00");
    const days = p.duration_days;

    const payload: any[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}`;

      payload.push({
        plan_id: activePlanId,
        session_date: iso,
        focus: {},
        target_questions: 30,
        completed_questions: 0,
      });
    }

    // Upsert by unique(plan_id, session_date)
    const res = await supabase.from("study_sessions").upsert(payload as any, { onConflict: "plan_id,session_date" });
    if (!res.error) await refreshSessions(activePlanId);
  }

  async function markDone(s: Session, completed: number) {
    await supabase.from("study_sessions").update({ completed_questions: completed }).eq("id", s.id);
    await refreshSessions(activePlanId);
  }

  const progress = useMemo(() => {
    const t = sessions.reduce((a, s) => a + (s.target_questions || 0), 0);
    const c = sessions.reduce((a, s) => a + (s.completed_questions || 0), 0);
    return { t, c, pct: t ? Math.round((c / t) * 100) : 0 };
  }, [sessions]);

  if (loading) return <p style={{ padding: 16 }}>Cargando planner…</p>;

  return (
    <main style={{ maxWidth: 1050, margin: "30px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Study Planner</h1>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/practice">Practice</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/flashcards">Flashcards</a>
          <a href="/notes">Notebook</a>
        </nav>
      </header>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Crear plan</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ minWidth: 240 }} />
          <label>
            Duración:&nbsp;
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <option key={d.days} value={d.days}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Inicio:&nbsp;
            <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
          </label>
          <button onClick={createPlan} style={{ padding: 10 }}>
            Crear
          </button>
        </div>
      </section>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Mis planes</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={activePlanId}
            onChange={async (e) => {
              const id = e.target.value;
              setActivePlanId(id);
              if (id) await refreshSessions(id);
            }}
          >
            <option value="">— Selecciona un plan —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.duration_days}d) {p.starts_on} → {p.ends_on}
              </option>
            ))}
          </select>

          <button onClick={generateSessions} style={{ padding: 10 }} disabled={!activePlanId}>
            Generar calendario
          </button>

          <span style={{ opacity: 0.85 }}>
            Progreso: <b>{progress.c}</b> / <b>{progress.t}</b> ({progress.pct}%)
          </span>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {sessions.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.85 }}>Selecciona un plan y genera el calendario.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <b>{s.session_date}</b>
                  <span style={{ opacity: 0.85 }}>
                    Target {s.target_questions} • Done {s.completed_questions}
                  </span>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => markDone(s, 0)} style={{ padding: 8 }}>
                    0
                  </button>
                  <button onClick={() => markDone(s, Math.floor(s.target_questions / 2))} style={{ padding: 8 }}>
                    50%
                  </button>
                  <button onClick={() => markDone(s, s.target_questions)} style={{ padding: 8 }}>
                    Completo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
