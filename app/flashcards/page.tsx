"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

type Card = {
  id: string;
  front_es: string | null;
  back_es: string | null;
  front_en: string | null;
  back_en: string | null;
  created_at: string;
};

type Review = {
  id: string;
  card_id: string;
  next_due: string;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Simple SM-2-ish update (good enough v1)
function computeNext(quality: number, ease: number, interval: number) {
  let e = ease;
  if (quality < 3) {
    return { ease: Math.max(1.3, e - 0.2), interval: 1 };
  }
  e = Math.max(1.3, e + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const nextInterval = interval <= 1 ? 3 : Math.round(interval * e);
  return { ease: e, interval: nextInterval };
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"es" | "en">("es");

  const [cards, setCards] = useState<Card[]>([]);
  const [dueIds, setDueIds] = useState<Set<string>>(new Set());

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      await refresh();
      setLoading(false);
    })();
  }, [router]);

  async function refresh() {
    const user = (await supabase.auth.getUser()).data.user!;
    const cRes = await supabase
      .from("flashcards")
      .select("id,front_es,back_es,front_en,back_en,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const list = (cRes.data ?? []) as Card[];
    setCards(list);

    // Due: based on flashcard_reviews.next_due (if no review yet -> due today)
    const rRes = await supabase
      .from("flashcard_reviews")
      .select("id,card_id,next_due")
      .in(
        "card_id",
        list.map((x) => x.id)
      );

    const reviews = (rRes.data ?? []) as Review[];
    const latestDueByCard = new Map<string, string>();

    for (const r of reviews) {
      const prev = latestDueByCard.get(r.card_id);
      if (!prev || r.next_due > prev) latestDueByCard.set(r.card_id, r.next_due);
    }

    const today = todayISO();
    const due = new Set<string>();
    for (const c of list) {
      const nd = latestDueByCard.get(c.id);
      if (!nd || nd <= today) due.add(c.id);
    }
    setDueIds(due);

    setIdx(0);
    setShowBack(false);
  }

  const dueCards = useMemo(() => cards.filter((c) => dueIds.has(c.id)), [cards, dueIds]);
  const current = dueCards[idx] ?? null;

  async function addCard() {
    const user = (await supabase.auth.getUser()).data.user!;
    const payload =
      lang === "es"
        ? { user_id: user.id, front_es: front, back_es: back }
        : { user_id: user.id, front_en: front, back_en: back };

    const res = await supabase.from("flashcards").insert(payload as any);
    if (!res.error) {
      setFront("");
      setBack("");
      await refresh();
    }
  }

  async function grade(quality: number) {
    if (!current) return;
    // Get last review to compute
    const last = await supabase
      .from("flashcard_reviews")
      .select("ease,interval_days")
      .eq("card_id", current.id)
      .order("reviewed_at", { ascending: false })
      .limit(1);

    const prevEase = (last.data?.[0]?.ease ?? 2.5) as number;
    const prevInt = (last.data?.[0]?.interval_days ?? 0) as number;

    const { ease, interval } = computeNext(quality, prevEase, prevInt);
    const next = new Date();
    next.setDate(next.getDate() + interval);

    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");
    const nextDue = `${yyyy}-${mm}-${dd}`;

    await supabase.from("flashcard_reviews").insert({
      card_id: current.id,
      quality,
      interval_days: interval,
      ease,
      next_due: nextDue,
    } as any);

    // move next
    setShowBack(false);
    setIdx((x) => Math.min(x + 1, Math.max(0, dueCards.length - 1)));
    await refresh();
  }

  if (loading) return <p style={{ padding: 16 }}>Cargando flashcards…</p>;

  return (
    <main style={{ maxWidth: 1050, margin: "30px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Flashcards</h1>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/practice">Practice</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/planner">Planner</a>
          <a href="/notes">Notebook</a>
        </nav>
      </header>

      <section style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setLang((x) => (x === "es" ? "en" : "es"))} style={{ padding: 10 }}>
          {lang === "es" ? "EN" : "ES"}
        </button>
        <span style={{ opacity: 0.85 }}>
          Due hoy: <b>{dueCards.length}</b> • Total: <b>{cards.length}</b>
        </span>
      </section>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Crear flashcard</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front" />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back" rows={4} />
          <button onClick={addCard} style={{ padding: 10 }} disabled={!front.trim() || !back.trim()}>
            Guardar
          </button>
        </div>
      </section>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Repasar (Spaced Repetition)</h2>

        {!current ? (
          <p style={{ margin: 0 }}>No tienes cards “due” hoy. ¡Vas bien! ✅</p>
        ) : (
          <>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              Card {idx + 1} / {dueCards.length}
            </p>

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <p style={{ marginTop: 0 }}>
                <b>Front:</b> {lang === "es" ? current.front_es ?? "—" : current.front_en ?? "—"}
              </p>
              {showBack && (
                <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  <b>Back:</b> {lang === "es" ? current.back_es ?? "—" : current.back_en ?? "—"}
                </p>
              )}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {!showBack ? (
                <button onClick={() => setShowBack(true)} style={{ padding: 10 }}>
                  Ver respuesta
                </button>
              ) : (
                <>
                  <span style={{ opacity: 0.85 }}>¿Qué tan bien la recordaste?</span>
                  <button onClick={() => grade(2)} style={{ padding: 10 }}>
                    Difícil
                  </button>
                  <button onClick={() => grade(4)} style={{ padding: 10 }}>
                    Bien
                  </button>
                  <button onClick={() => grade(5)} style={{ padding: 10 }}>
                    Fácil
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
