import { Suspense } from "react";
import { IntroDeck } from "@/decks/intro-deck";

// The deck reads `?scene=last` on the client, so it renders inside Suspense.
export default function IntroPage() {
  return (
    <Suspense>
      <IntroDeck />
    </Suspense>
  );
}
