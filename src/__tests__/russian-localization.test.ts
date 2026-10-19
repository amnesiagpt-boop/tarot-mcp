import { TarotCardManager } from "../tarot/cards/card-manager.js";
import { formatCardInfo } from "../tarot/cards/card-formatter.js";
import { getSpreadPickerCatalog } from "../tarot/readings/spread-localizations.js";
import { generateInterpretation } from "../tarot/readings/interpretation/index.js";
import { selectRelevantMeaning } from "../tarot/readings/interpretation/patterns.js";
import { getMoonPhaseRecommendations } from "../tarot/readings/lunar-utils.js";
import { SPREAD_TYPES } from "../tarot/shared/types.js";
import type { CardMeanings, DrawnCard } from "../tarot/shared/types.js";

const foreign = /[a-zA-Z\u3400-\u9fff]/;
describe("complete Russian visual reading content", () => {
  it("covers 78 cards, ten meanings each, symbols, descriptions and correspondences", async () => {
    const cards = (await TarotCardManager.create()).getAllCards();
    expect(cards).toHaveLength(78);
    for (const card of cards) {
      const ru = card.ru!;
      expect(ru, card.id).toBeDefined();
      expect(ru.name).toMatch(/[А-Яа-яЁё]/);
      expect(ru.symbolism).toHaveLength(card.symbolism.length);
      for (const orientation of ["upright", "reversed"] as const) {
        expect(ru.keywords![orientation]).toHaveLength(
          card.keywords[orientation].length,
        );
        expect(Object.keys(ru.meanings![orientation]).sort()).toEqual(
          Object.keys(card.meanings[orientation]).sort(),
        );
        for (const text of Object.values(ru.meanings![orientation])) {
          expect(text, card.id).not.toMatch(foreign);
          expect(text.length).toBeGreaterThan(180);
          expect(text).toContain(`«${ru.name}»`);
        }
        expect(formatCardInfo(card, orientation, "ru"), card.id).not.toMatch(
          foreign,
        );
      }
      expect(card.name).toMatch(/[A-Za-z]/); // canonical identifiers are unchanged
      expect((await TarotCardManager.create()).findCard(ru.name!)?.id).toBe(
        card.id,
      );
    }
  });

  it("keeps every built-in position and renders every analysis in Russian", async () => {
    const cards = (await TarotCardManager.create()).getAllCards();
    const catalog = getSpreadPickerCatalog("ru");
    expect(catalog.map((s) => s.id)).toEqual([...SPREAD_TYPES]);
    for (const spread of catalog) {
      expect(spread.positions).toHaveLength(spread.cardCount);
      for (const { name, meaning } of spread.positions) {
        expect(name).not.toMatch(foreign);
        expect(meaning).not.toMatch(foreign);
      }
      for (let pattern = 0; pattern < 4; pattern++) {
        const drawn: DrawnCard[] = spread.positions.map((position, i) => ({
          card: cards[(i * 11 + pattern * 7) % 78],
          orientation:
            pattern === 0
              ? "upright"
              : pattern === 1
                ? "reversed"
                : (i + pattern) % 2
                  ? "upright"
                  : "reversed",
          position: position.name,
          positionMeaning: position.meaning,
        }));
        const prose = generateInterpretation(
          drawn,
          "Как развивается моя жизнь?",
          spread.id,
          spread.name,
          "ru",
        );
        expect(prose, spread.id).not.toMatch(foreign);
        expect(prose, spread.id).not.toContain("undefined");
        expect(prose).toContain("Общее толкование");
      }
    }
  });

  it("uses Russian question context and translates all eight moon phases", () => {
    const meanings: CardMeanings = {
      general: "общее",
      love: "любовь",
      career: "карьера",
      health: "здоровье",
      spirituality: "духовность",
    };
    expect(selectRelevantMeaning(meanings, "Совет", "Что будет в любви?")).toBe(
      "любовь",
    );
    expect(
      selectRelevantMeaning(meanings, "Совет", "Как наладить отношения?"),
    ).toBe("любовь");
    expect(
      selectRelevantMeaning(
        meanings,
        "Совет",
        "Что происходит с моей работой?",
      ),
    ).toBe("карьера");
    expect(
      selectRelevantMeaning(meanings, "Совет", "Как улучшить здоровье?"),
    ).toBe("здоровье");
    expect(
      selectRelevantMeaning(
        meanings,
        "Совет",
        "Как понять предназначение души?",
      ),
    ).toBe("духовность");
    for (let day = 1; day <= 31; day++) {
      expect(
        getMoonPhaseRecommendations(new Date(Date.UTC(2026, 9, day)), "ru"),
      ).not.toMatch(foreign);
    }
  });
});
