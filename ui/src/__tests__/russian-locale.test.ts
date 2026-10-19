import {
  normalizeBeginPayload,
  normalizeConfirmedReading,
} from "../normalize.js";
import { restoreUiSnapshot } from "../ui-state.js";
import { t } from "../i18n.js";
import { messagesRu } from "../messages-ru.js";
import { errorCopy } from "../error-copy.js";

describe("Russian visual locale", () => {
  it("survives response normalization and confirmed session restoration", () => {
    const slots = Array.from({ length: 78 }, (_, i) => ({
      slotId: `slot-${i}`,
      index: i,
    }));
    const begin = normalizeBeginPayload({
      drawId: "draw-ru",
      language: "ru",
      spreadType: "single_card",
      spreadName: "Одна карта",
      requiredCount: 1,
      slots,
    });
    expect(begin.language).toBe("ru");
    const reading = normalizeConfirmedReading(
      {
        drawId: begin.drawId,
        language: "ru",
        spreadType: "single_card",
        spreadName: "Одна карта",
        cards: [
          {
            id: "fool",
            name: "The Fool",
            displayName: "Шут",
            orientation: "upright",
            position: "Послание",
          },
        ],
      },
      begin,
    );
    expect(reading.language).toBe("ru");
    const restored = restoreUiSnapshot(
      {
        version: 1,
        drawId: begin.drawId,
        deckOrder: slots.map((s) => s.slotId),
        selectedSlotIds: ["slot-0"],
        confirmedReading: reading,
        revealedIndices: [0],
        continuationSent: false,
      },
      begin,
    );
    expect(restored?.confirmedReading?.language).toBe("ru");
  });
  it("translates every UI message and transport error without leaking English diagnostics", () => {
    for (const key of Object.keys(messagesRu) as Array<
      keyof typeof messagesRu
    >) {
      expect(t("ru", key)).toMatch(/[А-Яа-яЁё]/);
    }
    expect(
      errorCopy(
        { message: "Select exactly 3 cards", code: "INVALID_SELECTION_COUNT" },
        "ru",
      ),
    ).toContain("ровно");
    expect(errorCopy({ message: "Failed to fetch" }, "ru")).toContain(
      "Нет связи",
    );
    expect(
      errorCopy({ message: "unavailable", httpStatus: 503 }, "ru"),
    ).toContain("503");
    expect(
      errorCopy({ message: "Expected 3 cards, received 2." }, "ru"),
    ).toContain("получено: 2");
  });
});
