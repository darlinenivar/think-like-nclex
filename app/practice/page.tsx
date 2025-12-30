import { Suspense } from "react";
import PracticeClient from "./practice-client";

export default function PracticePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <PracticeClient />
    </Suspense>
  );
}
