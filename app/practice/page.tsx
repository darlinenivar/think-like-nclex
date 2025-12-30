"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Lang = "es" | "en";
type MenuMode = "systems" | "categories" | "fundamentals";
type QType = "mcq" | "sata";

type QuestionRow = {
  id: string;
  system_key: string | null;
  client_need: string | null;
  sub_need: string | null;
  fundamentals_area?: string | null;

  qtype: QType;
  difficulty: number; // 1-5
  prompt_es: string;
  prompt_en: string;

  rationale_es: string;
  rationale_en: string;

  why_correct_es?: string | null;
  why_correct_en?: string | null;
  why_wrong_es?: string | null;
  why_wrong_en?: string | null;
  archer_es?: string | null;
  archer_en?: string | null;
  crusade_es?: string | null;
  crusade_en?: string | null;

  active?: boolean | null;
};

type OptionRow = {
  id: string;
  question_id: string;
  opt_key: string;
  text_es: string;
  text_en: string;
  is_correct: boolean;
};

type LoadedItem = { q: QuestionRow; options: OptionRow[] };

type ReviewRow = {
  n: number;
  prompt: string;
  qtype: QType;
  selected: string[];
  correctKeys: string[];
  ok: boolean;
  rationale: string;
  options: { key: string; text: string }[];
};

type PracticeSetup = {
  menu: MenuMode;
  mode: "tutor" | "cat";
  count: number;
  system?: string;
  category?: string;
  fund?: string;
};

const LS_KEY = "tln_last_setup_v1";

const SYSTEMS: { key: string; es: string; en: string }[] = [
  { key: "cardiovascular", es: "Cardiovascular", en: "Cardiovascular" },
  { key: "nervous", es: "Neurológico / Nervioso", en: "Neurologic / Nervous" },
  { key: "endocrine", es: "Endocrino", en: "Endocrine" },
  { key: "digestive", es: "Digestivo", en: "Digestive" },
  { key: "urinary", es: "Urinario", en: "Urinary" },
  { key: "reproductive", es: "Reproductivo", en: "Reproductive" },
  { key: "integumentary", es: "Tegumentario", en: "Integumentary" },
  { key: "respiratory", es: "Respiratorio", en: "Respiratory" },
  { key: "skeletal", es: "Esquelético", en: "Skeletal" },
  { key: "muscular", es: "Muscular", en: "Muscular" },
  { key: "lymphatic", es: "Linfático", en: "Lymphatic" },
  { key: "immune", es: "Inmunológico", en: "Immune" },
];

const CATEGORIES: { key: string; es: string; en: string }[] = [
  { key: "Management of Care", es: "Management of Care (Gestión del Cuidado)", en: "Management of Care" },
  { key: "Safety and Infection Control", es: "Safety & Infection Control", en: "Safety & Infection Control" },
  { key: "Health Promotion and Maintenance", es: "Health Promotion & Maintenance", en: "Health Promotion & Maintenance" },
  { key: "Psychosocial Integrity", es: "Psychosocial Integrity", en: "Psychosocial Integrity" },
  { key: "Pharmacology and Parenteral Therapies", es: "Pharmacology & Parenteral", en: "Pharmacology & Parenteral" },
  { key: "Basic Care and Comfort", es: "Basic Care & Comfort", en: "Basic Care & Comfort" },
  { key: "Reduction of Risk Potential", es: "Reduction of Risk Potential", en: "Reduction of Risk Potential" },
  { key: "Physiological Adaptation", es: "Physiological Adaptation", en: "Physiological Adaptation" },
];

const FUNDAMENTALS: { key: string; es: string; en: string }[] = [
  { key: "Fundamentals", es: "Fundamentos", en: "Fundamentals" },
  { key: "Med-Surg", es: "Med-Surg", en: "Med-Surg" },
  { key: "Maternity", es: "Maternidad", en: "Maternity" },
  { key: "Pediatrics", es: "Pediatría", en: "Pediatrics" },
  { key: "Pharmacology", es: "Farmacología", en: "Pharmacology" },
  { key: "Mental Health", es: "Salud mental", en: "Mental Health" },
  { key: "Priorities", es: "Prioridades (ABC/Maslow/Safety)", en: "Priorities (ABC/Maslow/Safety)" },
  { key: "SATA", es: "SATA", en: "SATA" },
  { key: "NGN", es: "Next Gen (casos clínicos)", en: "NGN (clinical cases)" },
];

function equalSets(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size !== B.size) return false;
  for (const x of A) if (!B.has(x)) return false;
  return true;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function pct(n: number) {
  if (!isFinite(n)) return 0;
  return Math.round(n * 100);
}

/* calculator */
function safeCalc(expr: string): number | null {
  try {
    const cleaned = expr.replace(/\s+/g, "");
    if (!cleaned) return null;
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) return null;
    // eslint-disable-next-line no-new-func
    const res = Function(`"use strict"; return (${cleaned})`)();
    if (typeof res !== "number" || !isFinite(res)) return null;
    return Math.round(res * 100000) / 100000;
  } catch {
    return null;
  }
}
function PhysicalCalculator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expr, setExpr] = useState("");
  const result = useMemo(() => safeCalc(expr), [expr]);
  const btn: React.CSSProperties = { padding: "14px 12px", borderRadius: 10, border: "1px solid #cfcfcf", background: "white", fontSize: 16, cursor: "pointer" };
  const op: React.CSSProperties = { ...btn, fontWeight: 900 };
  function press(v: string) { setExpr((e) => e + v); }
  function backspace() { setExpr((e) => e.slice(0, -1)); }
  function clearAll() { setExpr(""); }
  function toggleSign() {
    const cleaned = expr.trim();
    if (!cleaned) return;
    if (/^\-?\d+(\.\d+)?$/.test(cleaned)) { setExpr(cleaned.startsWith("-") ? cleaned.slice(1) : "-" + cleaned); return; }
    setExpr((e) => (e ? `(${e})*-1` : "-"));
  }
  function useResult() { if (result !== null) setExpr(String(result)); }
  if (!open) return null;

  return (
    <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 12, background: "#fafafa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <b>🧮 Calculator</b>
        <button onClick={onClose} style={{ ...btn, padding: "8px 10px" }}>✕</button>
      </div>

      <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 10, padding: 12, background: "white" }}>
        <div style={{ fontSize: 14, opacity: 0.75 }}>Expression</div>
        <div style={{ fontSize: 22, fontWeight: 900, wordBreak: "break-word" }}>{expr || "0"}</div>
        <div style={{ marginTop: 8, fontSize: 14, opacity: 0.75 }}>Result: <b>{result ?? "—"}</b></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 12 }}>
        <button style={btn} onClick={clearAll}>CE</button>
        <button style={btn} onClick={backspace}>⌫</button>
        <button style={btn} onClick={() => press("(")}>(</button>
        <button style={btn} onClick={() => press(")")}>)</button>

        <button style={btn} onClick={() => press("7")}>7</button>
        <button style={btn} onClick={() => press("8")}>8</button>
        <button style={btn} onClick={() => press("9")}>9</button>
        <button style={op} onClick={() => press("/")}>÷</button>

        <button style={btn} onClick={() => press("4")}>4</button>
        <button style={btn} onClick={() => press("5")}>5</button>
        <button style={btn} onClick={() => press("6")}>6</button>
        <button style={op} onClick={() => press("*")}>×</button>

        <button style={btn} onClick={() => press("1")}>1</button>
        <button style={btn} onClick={() => press("2")}>2</button>
        <button style={btn} onClick={() => press("3")}>3</button>
        <button style={op} onClick={() => press("-")}>−</button>

        <button style={btn} onClick={toggleSign}>±</button>
        <button style={btn} onClick={() => press("0")}>0</button>
        <button style={btn} onClick={() => press(".")}>.</button>
        <button style={op} onClick={() => press("+")}>+</button>

        <button style={{ ...btn, gridColumn: "span 2", fontWeight: 900 }} onClick={useResult} disabled={result === null}>= Use Result</button>
        <button
          style={{ ...btn, gridColumn: "span 2" }}
          onClick={async () => { if (result === null) return; try { await navigator.clipboard.writeText(String(result)); } catch {} }}
          disabled={result === null}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

/* CAT helper */
function pickNextCAT(pool: LoadedItem[], targetD: number) {
  if (pool.length === 0) return { picked: null as LoadedItem | null, nextPool: pool };
  let bestIdx = 0;
  let bestDist = Math.abs((pool[0].q.difficulty ?? 3) - targetD);
  for (let i = 1; i < pool.length; i++) {
    const d = Math.abs((pool[i].q.difficulty ?? 3) - targetD);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  const picked = pool[bestIdx];
  const nextPool = pool.filter((_, i) => i !== bestIdx);
  return { picked, nextPool };
}

function saveLastSetup(setup: PracticeSetup) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(setup));
  } catch {}
}

export default function PracticePage() {
  const router = useRouter();
  const search = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("es");

  const [catMode, setCatMode] = useState<boolean>((search.get("cat") || "") === "1");
  const [menuMode, setMenuMode] = useState<MenuMode>((search.get("menu") as MenuMode) || "systems");

  const [count, setCount] = useState<number>(Number(search.get("count") || "0"));
  const [customCount, setCustomCount] = useState<string>("");

  const [systemKey, setSystemKey] = useState<string>(search.get("system") || "");
  const [categoryKey, setCategoryKey] = useState<string>(search.get("category") || "");
  const [fundKey, setFundKey] = useState<string>(search.get("fund") || "");
  const [started, setStarted] = useState<boolean>((search.get("start") || "") === "1");

  const [pool, setPool] = useState<LoadedItem[]>([]);
  const [current, setCurrent] = useState<LoadedItem | null>(null);
  const [idx, setIdx] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [targetD, setTargetD] = useState(3);

  const [review, setReview] = useState<ReviewRow[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const didInit = useRef(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (didInit.current) return;
    didInit.current = true;

    setMenuMode((search.get("menu") as MenuMode) || "systems");
    setCatMode((search.get("cat") || "") === "1");
    setCount(Number(search.get("count") || "0"));
    setSystemKey(search.get("system") || "");
    setCategoryKey(search.get("category") || "");
    setFundKey(search.get("fund") || "");
    setStarted((search.get("start") || "") === "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function resetPerQuestion() {
    setSelected([]);
    setSubmitted(false);
    setIsCorrect(null);
    setShowRationale(false);
  }

  function pushUrl(next: Partial<{ menu: MenuMode; cat: boolean; count: number; system: string; category: string; fund: string; start: boolean }>) {
    const params = new URLSearchParams();

    const m = next.menu ?? menuMode;
    const cat = next.cat ?? catMode;
    const c = next.count ?? count;
    const sys = next.system ?? systemKey;
    const catKey = next.category ?? categoryKey;
    const f = next.fund ?? fundKey;
    const s = next.start ?? started;

    params.set("menu", m);
    if (cat) params.set("cat", "1");
    if (c > 0) params.set("count", String(c));
    if (m === "systems" && sys) params.set("system", sys);
    if (m === "categories" && catKey) params.set("category", catKey);
    if (m === "fundamentals" && f) params.set("fund", f);
    if (s) params.set("start", "1");

    router.push(`/practice?${params.toString()}`);
  }

  const selectionOk = useMemo(() => {
    if (count <= 0) return false;
    if (menuMode === "systems") return !!systemKey;
    if (menuMode === "categories") return !!categoryKey;
    return !!fundKey;
  }, [count, menuMode, systemKey, categoryKey, fundKey]);

  async function loadSession() {
    const sessionCount = clamp(count || 25, 5, 300);

    setSessionDone(false);
    setSessionCorrect(0);
    setIdx(0);
    setTargetD(3);
    setReview([]);
    setExpanded({});
    resetPerQuestion();

    setPool([]);
    setCurrent(null);

    let q = supabase
      .from("questions")
      .select(
        `
        id, system_key, client_need, sub_need, fundamentals_area,
        qtype, difficulty, prompt_es, prompt_en,
        rationale_es, rationale_en,
        why_correct_es, why_correct_en, why_wrong_es, why_wrong_en,
        archer_es, archer_en, crusade_es, crusade_en,
        active,
        question_options ( id, question_id, opt_key, text_es, text_en, is_correct )
      `
      )
      .eq("active", true)
      .limit(Math.max(250, sessionCount * 10));

    if (menuMode === "systems") q = q.eq("system_key", systemKey);
    if (menuMode === "categories") {
      const k = categoryKey.replace(/'/g, "''");
      q = q.or(`sub_need.ilike.%${k}%,client_need.ilike.%${k}%`);
    }
    if (menuMode === "fundamentals") q = q.eq("fundamentals_area", fundKey);

    const { data, error } = await q;
    if (error || !data || data.length === 0) {
      setCurrent(null);
      setPool([]);
      return;
    }

    const valid = (row: any) => row?.question_options && Array.isArray(row.question_options) && row.question_options.length >= 2;
    const raw = (data as any[]).filter(valid);

    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [raw[i], raw[j]] = [raw[j], raw[i]];
    }

    const loaded: LoadedItem[] = raw.map((x) => ({
      q: x as QuestionRow,
      options: (x.question_options ?? []) as OptionRow[],
    }));

    const take = Math.min(sessionCount, loaded.length);
    const working = loaded.slice(0, Math.max(take * 3, take));

    if (catMode) {
      const { picked, nextPool } = pickNextCAT(working, 3);
      setCurrent(picked);
      setPool(nextPool);
    } else {
      setCurrent(working[0] ?? null);
      setPool(working.slice(1, take));
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!started) return;
    if (!selectionOk) return;
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, started, selectionOk, menuMode, systemKey, categoryKey, fundKey, count, catMode]);

  const item = current;
  const sessionCount = clamp(count || 25, 5, 300);

  const promptText = useMemo(() => {
    if (!item) return "";
    const raw = lang === "es" ? item.q.prompt_es : item.q.prompt_en;
    return (raw || "").trim();
  }, [item, lang]);

  // ✅ SIN marcas
  const rationaleBlock = useMemo(() => {
    if (!item) return "";

    const correctKeys = item.options.filter((o) => o.is_correct).map((o) => o.opt_key.toUpperCase()).join(", ");

    const whyYes =
      (lang === "es" ? item.q.why_correct_es : item.q.why_correct_en) ||
      (lang === "es" ? item.q.rationale_es : item.q.rationale_en) ||
      "";

    const whyNo =
      (lang === "es" ? item.q.why_wrong_es : item.q.why_wrong_en) ||
      "";

    const strategy =
      (lang === "es" ? item.q.archer_es : item.q.archer_en) ||
      (lang === "es"
        ? "Piensa así: ¿hay riesgo inmediato? ¿qué es prioridad? ¿qué mata primero?"
        : "Think: immediate risk? what’s priority? what kills first?");

    const tip =
      (lang === "es" ? item.q.crusade_es : item.q.crusade_en) ||
      (lang === "es"
        ? "Enfócate en juicio clínico: seguridad, prioridades y resultados."
        : "Focus on clinical judgment: safety, priorities, and outcomes.");

    return `
✅ Respuesta correcta: ${correctKeys}

🧠 Por qué SÍ:
${whyYes}

❌ Por qué NO:
${whyNo || "(Recomendación: añade por qué cada opción incorrecta no aplica.)"}

🎯 Estrategia de resolución:
${strategy}

💡 Tip:
${tip}
`.trim();
  }, [item, lang]);

  function toggleOption(key: string) {
    if (!item || submitted || sessionDone) return;
    if (item.q.qtype === "mcq") setSelected([key]);
    else setSelected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  async function submit() {
    if (!item || sessionDone) return;

    const correctKeys = item.options.filter((o) => o.is_correct).map((o) => o.opt_key).sort();
    const ok = equalSets([...selected].sort(), correctKeys);

    setSubmitted(true);
    setIsCorrect(ok);

    // ✅ Tutor: explicación ahora. CAT: solo al final.
    setShowRationale(!catMode);

    setSessionCorrect((c) => c + (ok ? 1 : 0));
    if (catMode) setTargetD((d) => clamp(d + (ok ? 1 : -1), 1, 5));

    const reviewRow: ReviewRow = {
      n: idx + 1,
      prompt: promptText,
      qtype: item.q.qtype,
      selected: [...selected].map((x) => x.toUpperCase()),
      correctKeys: correctKeys.map((x) => x.toUpperCase()),
      ok,
      rationale: rationaleBlock,
      options: item.options.map((o) => ({
        key: o.opt_key.toUpperCase(),
        text: (lang === "es" ? o.text_es : o.text_en) || "",
      })),
    };
    setReview((r) => [...r, reviewRow]);

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from("attempts").insert({
        user_id: data.user.id,
        item_type: "question",
        question_id: item.q.id,
        selected_keys: selected,
        correct: ok,
      });
    }
  }

  function next() {
    if (sessionDone) return;

    if (idx + 1 >= sessionCount) {
      setSessionDone(true);
      return;
    }

    setIdx((i) => i + 1);
    resetPerQuestion();

    if (catMode) {
      setPool((p) => {
        const { picked, nextPool } = pickNextCAT(p, targetD);
        setCurrent(picked);
        return nextPool;
      });
    } else {
      setPool((p) => {
        const picked = p[0] ?? null;
        setCurrent(picked);
        return p.slice(1);
      });
    }
  }

  const scoreSoFarPct = pct(sessionCorrect / Math.max(1, idx + (submitted ? 1 : 0)));
  const finalPct = pct(sessionCorrect / Math.max(1, sessionCount));
  const pass = finalPct >= 85;

  if (loading) return <p style={{ padding: 20 }}>{lang === "es" ? "Cargando…" : "Loading…"}</p>;

  // START SCREEN
  if (!started || !selectionOk) {
    return (
      <main style={{ maxWidth: 980, margin: "22px auto", padding: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Tutor / CAT</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setLang((x) => (x === "es" ? "en" : "es"))}>{lang === "es" ? "EN" : "ES"}</button>
            <button onClick={() => setCalcOpen((v) => !v)}>🧮 Calc</button>
            <button onClick={() => router.push("/dashboard")}>Dashboard</button>
          </div>
        </header>

        <PhysicalCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />

        <section style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <b>Mode</b>
              <select
                value={catMode ? "cat" : "tutor"}
                onChange={(e) => {
                  const nextCat = e.target.value === "cat";
                  setCatMode(nextCat);
                  pushUrl({ cat: nextCat, start: false });
                }}
              >
                <option value="tutor">Tutor</option>
                <option value="cat">CAT</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <b>Menu</b>
              <select
                value={menuMode}
                onChange={(e) => {
                  const m = e.target.value as MenuMode;
                  setMenuMode(m);
                  setSystemKey("");
                  setCategoryKey("");
                  setFundKey("");
                  pushUrl({ menu: m, system: "", category: "", fund: "", start: false });
                }}
              >
                <option value="systems">{lang === "es" ? "Por sistema" : "By system"}</option>
                <option value="categories">{lang === "es" ? "Por categoría" : "By category"}</option>
                <option value="fundamentals">{lang === "es" ? "Fundamentos" : "Fundamentals"}</option>
              </select>
            </label>

            <div style={{ display: "grid", gap: 6 }}>
              <b>{lang === "es" ? "Cantidad de preguntas" : "Question count"}</b>
              <select
                value={count ? String(count) : ""}
                onChange={(e) => {
                  const v = Number(e.target.value || "0");
                  setCount(v);
                  pushUrl({ count: v, start: false });
                }}
              >
                <option value="">{lang === "es" ? "Selecciona…" : "Select…"}</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="150">150</option>
              </select>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  placeholder={lang === "es" ? "Custom (5–300)" : "Custom (5–300)"}
                  style={{ padding: 9, borderRadius: 10, border: "1px solid #ccc", width: 150 }}
                />
                <button
                  onClick={() => {
                    const n = Number(customCount);
                    if (!Number.isFinite(n)) return;
                    const nn = clamp(Math.floor(n), 5, 300);
                    setCount(nn);
                    pushUrl({ count: nn, start: false });
                    setCustomCount("");
                  }}
                  style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #ccc", background: "white", fontWeight: 800 }}
                >
                  Apply
                </button>
              </div>
            </div>

            {menuMode === "systems" && (
              <label style={{ display: "grid", gap: 6 }}>
                <b>{lang === "es" ? "Sistema" : "System"}</b>
                <select
                  value={systemKey}
                  onChange={(e) => {
                    const v = e.target.value || "";
                    setSystemKey(v);
                    pushUrl({ system: v, start: false });
                  }}
                >
                  <option value="">{lang === "es" ? "Selecciona un sistema…" : "Select a system…"}</option>
                  {SYSTEMS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {lang === "es" ? s.es : s.en}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {menuMode === "categories" && (
              <label style={{ display: "grid", gap: 6 }}>
                <b>{lang === "es" ? "Categoría" : "Category"}</b>
                <select
                  value={categoryKey}
                  onChange={(e) => {
                    const v = e.target.value || "";
                    setCategoryKey(v);
                    pushUrl({ category: v, start: false });
                  }}
                >
                  <option value="">{lang === "es" ? "Selecciona una categoría…" : "Select a category…"}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {lang === "es" ? c.es : c.en}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {menuMode === "fundamentals" && (
              <label style={{ display: "grid", gap: 6 }}>
                <b>{lang === "es" ? "Fundamentos" : "Fundamentals"}</b>
                <select
                  value={fundKey}
                  onChange={(e) => {
                    const v = e.target.value || "";
                    setFundKey(v);
                    pushUrl({ fund: v, start: false });
                  }}
                >
                  <option value="">{lang === "es" ? "Selecciona…" : "Select…"}</option>
                  {FUNDAMENTALS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {lang === "es" ? f.es : f.en}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => {
                const setup: PracticeSetup = {
                  menu: menuMode,
                  mode: catMode ? "cat" : "tutor",
                  count,
                  system: menuMode === "systems" ? systemKey : undefined,
                  category: menuMode === "categories" ? categoryKey : undefined,
                  fund: menuMode === "fundamentals" ? fundKey : undefined,
                };
                saveLastSetup(setup);

                setStarted(true);
                pushUrl({ start: true });
              }}
              disabled={!selectionOk}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: selectionOk ? "white" : "#f3f3f3", fontWeight: 900 }}
            >
              Start
            </button>
            {!selectionOk && (
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                Selecciona cantidad + {menuMode === "systems" ? "sistema" : menuMode === "categories" ? "categoría" : "fundamentos"} para continuar.
              </span>
            )}
          </div>
        </section>
      </main>
    );
  }

  // QUESTION SCREEN
  if (!item) {
    return (
      <main style={{ maxWidth: 980, margin: "22px auto", padding: 16 }}>
        <p>No hay preguntas para este filtro. (Verifica que existan preguntas y active=true)</p>
        <button onClick={() => { setStarted(false); pushUrl({ start: false }); }}>Volver</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: "22px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Tutor / CAT</h2>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Mode: <b>{catMode ? "CAT" : "Tutor"}</b> • Progress: <b>Q {idx + 1}/{sessionCount}</b> • Score: <b>{scoreSoFarPct}%</b>
            {catMode ? <> • Target: <b>D{targetD}</b></> : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setLang((x) => (x === "es" ? "en" : "es"))}>{lang === "es" ? "EN" : "ES"}</button>
          <button onClick={() => setCalcOpen((v) => !v)}>🧮 Calc</button>
          <button onClick={() => router.push("/dashboard")}>Dashboard</button>
          <button onClick={() => { setStarted(false); pushUrl({ start: false }); }}>Change setup</button>
        </div>
      </header>

      <PhysicalCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />

      {sessionDone ? (
        <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Results</h3>
          <p>
            Correct: <b>{sessionCorrect}</b> / {sessionCount} → <b>{finalPct}%</b>
          </p>
          <p style={{ fontWeight: 900 }}>{pass ? "✅ PASS (≥85%)" : "❌ FAIL (<85%)"}</p>

          {/* ✅ CAT: explicaciones solo aquí */}
          {catMode && review.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ marginTop: 0 }}>Review</h3>

              <div style={{ display: "grid", gap: 12 }}>
                {review.map((r) => (
                  <div key={r.n} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <b>Q{r.n} • {r.ok ? "✅ Correct" : "❌ Incorrect"}</b>
                      <button
                        onClick={() => setExpanded((e) => ({ ...e, [r.n]: !e[r.n] }))}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}
                      >
                        {expanded[r.n] ? "Hide explanation" : "Show explanation"}
                      </button>
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 800 }}>{r.prompt}</div>

                    <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                      {r.options.map((o) => {
                        const picked = r.selected.includes(o.key);
                        const correct = r.correctKeys.includes(o.key);
                        return (
                          <div
                            key={o.key}
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              border: "1px solid #eee",
                              background: correct ? "#f0fff4" : picked ? "#fff5f5" : "white",
                            }}
                          >
                            <b>{o.key}.</b> {o.text}
                            {correct ? <span style={{ marginLeft: 8, fontWeight: 900 }}>✓</span> : null}
                            {!correct && picked ? <span style={{ marginLeft: 8, fontWeight: 900 }}>✕</span> : null}
                          </div>
                        );
                      })}
                    </div>

                    {expanded[r.n] && (
                      <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{r.rationale}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={loadSession}>Restart</button>
            <button onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
          </div>
        </section>
      ) : (
        <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{promptText}</h3>

          {item.q.qtype === "sata" && (
            <p><b>{lang === "es" ? "Seleccione todas las que apliquen" : "Select all that apply"}</b></p>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {item.options.map((o) => (
              <button
                key={o.id}
                onClick={() => toggleOption(o.opt_key)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: selected.includes(o.opt_key) ? "#e6f0ff" : "white",
                  textAlign: "left",
                }}
              >
                <b>{o.opt_key.toUpperCase()}.</b> {lang === "es" ? o.text_es : o.text_en}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={submit} disabled={submitted || selected.length === 0}>Submit</button>
            <button onClick={next} disabled={!submitted}>{idx + 1 >= sessionCount ? "Finish →" : "Next →"}</button>
            {submitted && <span>{isCorrect ? "✅ Correct" : "❌ Incorrect"}</span>}

            {/* ✅ Tutor only */}
            {submitted && !catMode && (
              <button onClick={() => setShowRationale((v) => !v)}>{showRationale ? "Hide explanation" : "Show explanation"}</button>
            )}
          </div>

          {/* ✅ Tutor only */}
          {submitted && !catMode && showRationale && (
            <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{rationaleBlock}</pre>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
