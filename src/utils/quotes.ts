export interface Quote {
  text: string;
  author: string;
  category: 'focus' | 'grit' | 'mindset' | 'learning';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    text: "Deep work is the ability to focus without distraction on a cognitively demanding task. It makes you produce at an elite level.",
    author: "Cal Newport",
    category: "focus",
  },
  {
    text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    author: "Richard Feynman",
    category: "learning",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant (on Aristotle)",
    category: "grit",
  },
  {
    text: "Concentration is the secret of strength in politics, in war, in trade, in short in all human management.",
    author: "Ralph Waldo Emerson",
    category: "focus",
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    category: "mindset",
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein",
    category: "grit",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    category: "mindset",
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
    category: "grit",
  },
  {
    text: "Real learning begins where comfort ends. Lean into the friction of tough problems.",
    author: "Cognitive Science Principle",
    category: "learning",
  },
  {
    text: "Your future exam score is being written right now in this single block of focused attention.",
    author: "Study Philosophy",
    category: "focus",
  }
];

export const FOCUS_NUDGES = [
  "Stay with the current sentence. Distractions are just thoughts passing by.",
  "Great job maintaining rhythm. Your brain is building myelin pathways right now.",
  "One concept at a time. Quality of focus matters more than rushed speed.",
  "Breathe slowly, release shoulder tension, and immerse in the material.",
  "You've survived 100% of your hardest study sessions. Keep this momentum."
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

export function getRandomNudge(): string {
  const index = Math.floor(Math.random() * FOCUS_NUDGES.length);
  return FOCUS_NUDGES[index];
}
