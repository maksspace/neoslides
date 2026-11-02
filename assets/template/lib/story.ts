// Everything the presentation says lives here, so the story can be tuned before the talk
// without touching layout code. Scene order and beats live in decks/*.tsx; tour copy in lib/tour.ts;
// the visual style in lib/look.ts.

export const product = {
  name: "Away",
  mark: "A",
  tagline: "Time off in two clicks",
  lang: "en",
};

// Chrome labels used by the deck, the tour panel and the prototype banner.
export const ui = {
  next: "Next",
  back: "Back",
  scene: "Scene",
  fullscreen: "Fullscreen (F)",
  exit: "Exit to the product (Esc)",
  startHint: "→ to start · F for fullscreen",
  presenter: "Presenter",
  toFinale: "To the finale",
  collapse: "Collapse (H)",
  closeGuide: "Close the guide",
  restart: "Start over with fresh data",
  vision: "What's next",
  prototype: "Prototype · data lives only in this browser",
  startTour: "Live demo",
  startDeck: "Presentation",
  openProduct: "Open the product",
  effects: "Effects library",
};

// The example talk follows one person through one small task ("user journey" pattern):
// meet Anna → the paper she has to fill in burns → her path today vs with Away → live demo →
// what's next + poll → finale. A different idea would get a different arc and different effects.

export const intro = {
  label: "Away · one day off",

  meet: {
    eyebrow: "Friday, 4 pm",
    title: "This is Anna.",
    accent: "She needs one day off.",
    lead: "Her son has a school play on Monday morning. Anna wants the day off. Here's what happens next.",
    hint: "→ to start · F for fullscreen",
  },

  paper: {
    eyebrow: "Step one",
    title: "First, a form.",
    accent: "Handwritten, free-form.",
    after: "Away starts by making this paper disappear.",
    form: {
      heading: "Leave request",
      to: "To: Head of Payments\nFrom: A. Reed, Developer",
      body: "I hereby request one (1) calendar day of paid annual leave…",
      fields: ["Date", "Employee signature", "Approved: manager", "Approved: HR"],
    },
  },

  path: {
    eyebrow: "Today",
    eyebrowNext: "With Away",
    title: "One day off,",
    accent: "four days of waiting.",
    titleNext: "Two dates,",
    accentNext: "and done.",
    waiting: "waiting…",
    lead: "Every step goes through another person. By the time everyone replies, Monday is gone.",
    leadNext: "The balance is visible at once, a rule approves short leave by itself, and the lead sees only the exceptions.",
    steps: [
      { title: "I need a day off", blocker: "", fixed: "" },
      { title: "How many days left?", blocker: "ask HR", fixed: "visible at once" },
      { title: "Who covers for me?", blocker: "ask in chat", fixed: "team calendar" },
      { title: "Lead's signature", blocker: "in meetings", fixed: "a rule" },
      { title: "HR order", blocker: "done by hand", fixed: "automatic" },
      { title: "School play", blocker: "", fixed: "" },
    ],
  },

  turn: {
    eyebrow: "Away",
    title: "Let's see",
    accent: "how it goes for Anna now.",
    cta: "Open the product",
  },
};

export const vision = {
  label: "Away · what's next",

  next: {
    eyebrow: "This is version one",
    title: "What we build next,",
    accent: "you decide.",
    lead: "The prototype took a couple of days, so we can discuss the product, not slides.",
    channel: "Ideas and feedback → #away-feedback",
    question: "What should come first?",
    topics: ["Calendar sync", "Sick leave", "Hourly time off", "Mobile app"],
    hint: "Vote live: tap the options",
    reset: "Reset",
  },

  finale: {
    title: "Away",
    lead: "One day off, zero paperwork.\nThank you! Questions?",
    product: "Back to the product",
    again: "Play from the start",
  },
};
