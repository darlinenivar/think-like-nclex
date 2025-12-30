"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

type Note = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

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
    const res = await supabase
      .from("notes")
      .select("id,title,body,tags,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!res.error) setNotes((res.data ?? []) as Note[]);
  }

  async function addNote() {
    const user = (await supabase.auth.getUser()).data.user!;
    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim() || null,
      body,
      tags: tagArr,
    } as any);

    if (!res.error) {
      setTitle("");
      setBody("");
      setTags("");
      await refresh();
    }
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    await refresh();
  }

  if (loading) return <p style={{ padding: 16 }}>Cargando notebook…</p>;

  return (
    <main style={{ maxWidth: 1050, margin: "30px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Notebook</h1>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/practice">Practice</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/planner">Planner</a>
          <a href="/flashcards">Flashcards</a>
        </nav>
      </header>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Nueva nota</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escribe tu nota…" rows={6} />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (separados por coma)" />
          <button onClick={addNote} style={{ padding: 10 }} disabled={!body.trim()}>
            Guardar nota
          </button>
        </div>
      </section>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Mis notas</h2>
        {notes.length === 0 ? (
          <p style={{ margin: 0 }}>Aún no tienes notas.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {notes.map((n) => (
              <div key={n.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>{n.title ?? "Sin título"}</h3>
                  <button onClick={() => deleteNote(n.id)} style={{ padding: 8 }}>
                    Borrar
                  </button>
                </div>
                <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
                <p style={{ marginBottom: 0, opacity: 0.8 }}>
                  Tags: <b>{(n.tags ?? []).join(", ") || "—"}</b> • Updated: {new Date(n.updated_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
