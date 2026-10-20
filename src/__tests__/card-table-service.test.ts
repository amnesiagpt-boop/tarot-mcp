import { beforeAll, describe, expect, it } from "vitest";
import { CardTableService, TableError } from "../table/card-table-service.js";
import { TarotCardManager } from "../tarot/cards/card-manager.js";
import {
  interpretSystem,
  lenormandCards,
  lenormandCombinations,
  playingCards,
  type PositionedCard,
} from "../table/system-adapters.js";
import { DECKS } from "../tarot/shared/decks.js";
let manager: TarotCardManager;
beforeAll(async () => {
  manager = await TarotCardManager.create();
});
const positions = [
  { name: "Контекст", meaning: "Исходная ситуация" },
  { name: "Действие", meaning: "Что можно предпринять" },
  {
    name: "Направление",
    meaning: "Возможный путь, который зависит от действий",
  },
];
const input = (deckId = "tarot-classic") => ({
  deckId,
  language: "ru",
  question: "Как обсудить задачу?",
  readingKind: "spread",
  spreadType: "three_card",
  tableSpreadName: "Три карты",
  tablePositions: positions,
});
describe("independent deck systems", () => {
  for (const deck of DECKS)
    it(`prepares ${deck.size} opaque slots for ${deck.id} and confirms exactly the chosen cards`, () => {
      const service = new CardTableService(manager.getAllCards());
      const draw = service.begin(input(deck.id));
      expect(draw.slots).toHaveLength(deck.size);
      expect(new Set(draw.slots.map((s) => s.slotId)).size).toBe(deck.size);
      expect(JSON.stringify(draw)).not.toContain("imageUri");
      expect(JSON.stringify(draw)).not.toContain("keywords");
      const selection = draw.slots.slice(0, 3).map((s) => s.slotId);
      const reading = service.confirm(draw.drawId, selection) as {
        cards: PositionedCard[];
        deckId: string;
        interpretation: string;
      };
      expect(reading.deckId).toBe(deck.id);
      expect(new Set(reading.cards.map((c) => c.id)).size).toBe(3);
      expect(reading.cards.map((c) => c.position)).toEqual(
        positions.map((p) => p.name),
      );
      expect(reading.cards.every((c) => c.orientation === "upright")).toBe(
        true,
      );
      expect(service.confirm(draw.drawId, selection)).toEqual(reading);
      expect(() =>
        service.confirm(
          draw.drawId,
          draw.slots.slice(3, 6).map((s) => s.slotId),
        ),
      ).toThrow(TableError);
    });
  it("rejects duplicated cards, foreign slots and unrecognized options", () => {
    const service = new CardTableService(manager.getAllCards()),
      draw = service.begin(input());
    const a = draw.slots[0].slotId;
    expect(() => service.confirm(draw.drawId, [a, a, a])).toThrow();
    expect(() =>
      service.confirm(draw.drawId, [
        "slot_foreign",
        ...draw.slots.slice(0, 2).map((s) => s.slotId),
      ]),
    ).toThrow();
    expect(() =>
      service.begin({ ...input(), providerSecret: "unused" }),
    ).toThrow();
    expect(() =>
      service.begin({ ...input("playing-36"), reversalsEnabled: true }),
    ).toThrow();
  });
  it("preserves retries and rejects reuse of a key for a different deck", () => {
    const service = new CardTableService(manager.getAllCards());
    const req = { ...input(), idempotencyKey: "retry-key" };
    expect(service.begin(req)).toEqual(service.begin(req));
    expect(() => service.begin({ ...req, deckId: "playing-52" })).toThrow();
  });
  it("expires pending state without treating it as an archived reading", () => {
    let now = 0;
    const service = new CardTableService(manager.getAllCards(), () => now);
    const draw = service.begin(input());
    now = 24 * 60 * 60 * 1000 + 1;
    expect(() =>
      service.confirm(
        draw.drawId,
        draw.slots.slice(0, 3).map((s) => s.slotId),
      ),
    ).toThrow();
  });
  it("keeps the 36-card and 52-card rank sets separate", () => {
    const small = playingCards(36),
      full = playingCards(52);
    expect(small).toHaveLength(36);
    expect(full).toHaveLength(52);
    expect(small.some((c) => ["2", "3", "4", "5"].includes(c.rank!))).toBe(
      false,
    );
    expect(full.filter((c) => c.rank === "2")).toHaveLength(4);
    expect(new Set(full.map((c) => c.suit)).size).toBe(4);
  });
  it("uses only explicitly sourced directional Lenormand combinations", () => {
    const cards = lenormandCards();
    const positioned = (number: number) => ({
      ...cards[number - 1],
      displayName: cards[number - 1].name,
      position: "Контекст",
      positionMeaning: "",
    });
    expect(
      lenormandCombinations([positioned(24), positioned(25)]).known,
    ).toHaveLength(1);
    expect(lenormandCombinations([positioned(1), positioned(2)]).missing).toBe(
      1,
    );
    const unknown = interpretSystem(
      "lenormand-classic",
      [positioned(1), positioned(2)],
      "ru",
    );
    expect(unknown).toContain("нет правила");
    expect(unknown).not.toContain("гарантирован");
  });
  it("separates card meaning from the role of each position", () => {
    const card = {
      ...lenormandCards()[5],
      displayName: "Тучи",
      position: "Направление",
      positionMeaning: "Возможное направление",
    };
    const text = interpretSystem("lenormand-classic", [card], "ru");
    expect(text).toContain("Неясность");
    expect(text).toContain("Роль позиции");
    expect(text).toContain("При каких условиях");
    expect(text).not.toContain("благоприятн");
  });
});
