import { Suspense } from "react";
import { VisionDeck } from "@/decks/vision-deck";

export default function VisionPage() {
  return (
    <Suspense>
      <VisionDeck />
    </Suspense>
  );
}
