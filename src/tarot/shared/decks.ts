export type DeckId =
  "tarot-classic" | "lenormand-classic" | "playing-36" | "playing-52";
export interface DeckDefinition {
  id: DeckId;
  name: string;
  size: number;
  system: "tarot" | "lenormand" | "playing";
  description: string;
  preview: string[];
  assetBase: string;
}
export const DECKS: readonly DeckDefinition[] = [
  {
    id: "tarot-classic",
    name: "Классическое Таро",
    size: 78,
    system: "tarot",
    description:
      "78 карт · основная система · перевёрнутые значения выключены по умолчанию",
    preview: ["star", "sun", "high_priestess"],
    assetBase: "/assets/cards/midnight-art-nouveau-v1",
  },
  {
    id: "lenormand-classic",
    name: "Классический Ленорман",
    size: 36,
    system: "lenormand",
    description: "36 карт · отдельная система значений и сочетаний",
    preview: ["lenormand_16", "lenormand_24", "lenormand_25"],
    assetBase: "/assets/cards/midnight-art-nouveau-v1",
  },
  {
    id: "playing-36",
    name: "Игральные карты · 36",
    size: 36,
    system: "playing",
    description: "От шестёрки до туза · отдельные значения мастей и достоинств",
    preview: [
      "playing_hearts_ace",
      "playing_clubs_queen",
      "playing_spades_king",
    ],
    assetBase: "/assets/cards/midnight-art-nouveau-v1",
  },
  {
    id: "playing-52",
    name: "Игральные карты · 52",
    size: 52,
    system: "playing",
    description: "От двойки до туза · полная игральная колода без джокеров",
    preview: [
      "playing_diamonds_ace",
      "playing_hearts_queen",
      "playing_clubs_king",
    ],
    assetBase: "/assets/cards/midnight-art-nouveau-v1",
  },
];
export function getDeck(id: string = "tarot-classic"): DeckDefinition {
  const deck = DECKS.find((d) => d.id === id);
  if (!deck) throw new Error("Неизвестная колода");
  return deck;
}
export function cardImage(deckId: DeckId, cardId: string): string {
  const deck = getDeck(deckId);
  return (
    deck.assetBase +
    "/" +
    (deck.system === "playing" ? "playing_" : "") +
    cardId +
    ".webp?v=modern-20261020"
  );
}
const MAJORS = [
  "fool",
  "magician",
  "high_priestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheel_of_fortune",
  "justice",
  "hanged_man",
  "death",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "world",
];
const RANKS = [
  "",
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "page",
  "knight",
  "queen",
  "king",
];
export function canonicalTarotId(card: {
  id?: unknown;
  number?: unknown;
  arcana?: unknown;
  suit?: unknown;
}): string {
  const number = Number(card.number);
  if (card.arcana === "major" && Number.isInteger(number) && MAJORS[number])
    return MAJORS[number];
  if (
    ["wands", "cups", "swords", "pentacles"].includes(String(card.suit)) &&
    RANKS[number]
  )
    return `${RANKS[number]}_of_${card.suit}`;
  const raw = String(card.id ?? "")
    .replaceAll("-", "_")
    .replaceAll(".", "_");
  const major = raw.replace(/^major_/, "").replace(/^the_/, "");
  if (MAJORS.includes(major)) return major;
  const minor = raw.replace(/^(wands|cups|swords|pentacles)_/, "");
  return /^[a-z]+_of_(wands|cups|swords|pentacles)$/.test(minor) ? minor : raw;
}
