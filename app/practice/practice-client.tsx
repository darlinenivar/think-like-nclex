"use client";

import { useSearchParams } from "next/navigation";

export default function PracticeClient() {
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const count = searchParams.get("count");

  return (
    <div style={{ padding: 24 }}>
      <h1>Practice Mode</h1>

      <p><strong>Mode:</strong> {mode || "not selected"}</p>
      <p><strong>Questions:</strong> {count || "not selected"}</p>
    </div>
  );
}
