import type { DeckStage } from "@/components/deck/stages";

// The chosen style, kept apart from the words in story.ts. When the person gives a reference
// (a site, a screenshot), its tokens go into app/themes.css as a new theme, and this file says
// which theme and stage the talk uses. See the skill's references/style-from-reference.md.

export const look: { theme: string; stage: DeckStage } = {
  /** A theme id from lib/themes.ts. The viewer can still switch it in the product header. */
  theme: "editorial",
  /** Default deck backdrop; a deck can override it with <Deck stage>. */
  stage: "paper",
};
