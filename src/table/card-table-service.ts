import { createHash, randomInt, randomUUID } from "node:crypto";
import { TarotCardManager } from "../tarot/cards/card-manager.js";
import { getDeck, type DeckId } from "../tarot/shared/decks.js";
import type { TarotCard } from "../tarot/shared/types.js";
import {
  interpretSystem,
  lenormandCards,
  playingCards,
  tarotCards,
  type SystemCard,
  type PositionedCard,
} from "./system-adapters.js";

export class TableError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
interface Position {
  name: string;
  meaning: string;
}
interface RecordEntry {
  expires: number;
  fingerprint: string;
  slots: Map<string, SystemCard>;
  begin: ReturnType<CardTableService["payload"]>;
  selected?: string[];
  result?: object;
}
const text = (v: unknown, max: number, required = false): string => {
  if (v === undefined && !required) return "";
  if (typeof v !== "string" || v.trim().length > max || (required && !v.trim()))
    throw new TableError(
      "INVALID_INPUT",
      400,
      "Проверь текст вопроса и параметры расклада.",
    );
  return v.trim();
};

/** Opaque, short-lived decks. Abandoned draws and personal questions are never logged. */
export class CardTableService {
  private records = new Map<string, RecordEntry>();
  private idempotency = new Map<string, { id: string; hash: string }>();
  constructor(
    private tarot: readonly TarotCard[],
    private now: () => number = Date.now,
  ) {}
  static async create() {
    const manager = await TarotCardManager.create();
    return new CardTableService(manager.getAllCards());
  }
  private sweep() {
    for (const [id, row] of this.records)
      if (row.expires < this.now()) this.records.delete(id);
    for (const [key, row] of this.idempotency)
      if (!this.records.has(row.id)) this.idempotency.delete(key);
  }
  private payload(
    id: string,
    deckId: DeckId,
    language: string,
    question: string,
    spreadType: string,
    spreadName: string,
    positions: Position[],
    slots: string[],
  ) {
    const deck = getDeck(deckId);
    return {
      drawId: id,
      readingKind: positions.length === 1 ? "daily" : "spread",
      question,
      language,
      spreadType,
      spreadName,
      requiredCount: positions.length,
      positions,
      deckId,
      deckName: deck.name,
      deckSize: deck.size,
      slots: slots.map((slotId, index) => ({ slotId, index })),
      deck: {
        size: deck.size,
        backImageUri: "/assets/cards/midnight-art-nouveau-v1/back.webp",
        slots: slots.map((slotId, index) => ({ slotId, index })),
      },
    };
  }
  begin(input: Record<string, unknown>) {
    this.sweep();
    const allowed = [
      "deckId",
      "language",
      "question",
      "readingKind",
      "spreadType",
      "customSpread",
      "customDate",
      "idempotencyKey",
      "reversalsEnabled",
      "tablePositions",
      "tableSpreadName",
    ];
    if (Object.keys(input).some((k) => !allowed.includes(k)))
      throw new TableError(
        "INVALID_INPUT",
        400,
        "Неизвестный параметр расклада.",
      );
    let deck;
    try {
      deck = getDeck(text(input.deckId, 40, true));
    } catch {
      throw new TableError("INVALID_DECK", 400, "Выбери доступную колоду.");
    }
    const language = input.language ?? "ru";
    if (!["ru", "en", "zh"].includes(String(language)))
      throw new TableError("INVALID_INPUT", 400, "Неизвестный язык.");
    const kind = input.readingKind ?? "spread";
    if (!["spread", "daily", "custom"].includes(String(kind)))
      throw new TableError(
        "INVALID_INPUT",
        400,
        "Этот режим не поддерживается выбранной системой.",
      );
    const question = text(input.question, 2000, kind !== "daily") || "Тема дня";
    if (
      input.reversalsEnabled !== undefined &&
      typeof input.reversalsEnabled !== "boolean"
    )
      throw new TableError(
        "INVALID_INPUT",
        400,
        "Параметр перевёрнутых карт должен быть логическим.",
      );
    if (input.reversalsEnabled && deck.system !== "tarot")
      throw new TableError(
        "INVALID_INPUT",
        400,
        "Для этой системы перевёрнутые значения не используются.",
      );
    let positions: Position[];
    if (kind === "daily")
      positions = [
        {
          name: language === "ru" ? "Тема дня" : "Daily focus",
          meaning:
            language === "ru"
              ? "На что обратить внимание сегодня."
              : "A theme to reflect on today.",
        },
      ];
    else {
      const custom = input.customSpread as
        { name?: unknown; positions?: unknown } | undefined;
      const raw = kind === "custom" ? custom?.positions : input.tablePositions;
      if (
        !Array.isArray(raw) ||
        raw.length < 1 ||
        raw.length > 15 ||
        raw.length > deck.size
      )
        throw new TableError(
          "INVALID_POSITIONS",
          400,
          "Нужно от1 до15 позиций.",
        );
      positions = raw.map((p) => {
        if (!p || typeof p !== "object" || Array.isArray(p))
          throw new TableError(
            "INVALID_POSITIONS",
            400,
            "Проверь названия позиций.",
          );
        return { name: text(p.name, 160, true), meaning: text(p.meaning, 500) };
      });
    }
    const spreadType = text(input.spreadType, 80) || String(kind);
    const spreadName =
      text((input.customSpread as { name?: unknown })?.name, 100) ||
      text(input.tableSpreadName, 120) ||
      (positions.length === 1 ? "Карта дня" : `Расклад · ${positions.length}`);
    const hash = createHash("sha256")
      .update(
        JSON.stringify({
          deck: deck.id,
          language,
          question,
          positions,
          spreadType,
          spreadName,
          reversed: input.reversalsEnabled === true,
        }),
      )
      .digest("hex");
    const key = text(input.idempotencyKey, 128);
    if (key) {
      const old = this.idempotency.get(key);
      if (old) {
        if (old.hash !== hash)
          throw new TableError(
            "IDEMPOTENCY_CONFLICT",
            409,
            "Этот запрос уже использован для другого расклада.",
          );
        return this.records.get(old.id)!.begin;
      }
    }
    if (this.records.size >= 1000)
      throw new TableError(
        "DRAW_CAPACITY_REACHED",
        503,
        "Слишком много незавершённых раскладов. Попробуй немного позже.",
      );
    let cards: SystemCard[];
    if (deck.system === "tarot") {
      const direct = tarotCards(this.tarot, String(language), false),
        reverse = tarotCards(this.tarot, String(language), true);
      cards = direct.map((c, i) =>
        input.reversalsEnabled && randomInt(2) ? reverse[i] : c,
      );
    } else
      cards =
        deck.system === "lenormand"
          ? lenormandCards()
          : playingCards(deck.size as 36 | 52);
    if (
      cards.length !== deck.size ||
      new Set(cards.map((c) => c.id)).size !== deck.size
    )
      throw new TableError(
        "INVALID_DECK",
        500,
        "Состав колоды не прошёл проверку.",
      );
    for (let i = cards.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    const slots = new Map(cards.map((c) => ["slot_" + randomUUID(), c]));
    const id = "table_" + randomUUID();
    const begin = this.payload(
      id,
      deck.id,
      String(language),
      question,
      spreadType,
      spreadName,
      positions,
      [...slots.keys()],
    );
    this.records.set(id, {
      expires: this.now() + 24 * 60 * 60 * 1000,
      fingerprint: hash,
      slots,
      begin,
    });
    if (key) this.idempotency.set(key, { id, hash });
    return begin;
  }
  confirm(id: string, selected: unknown) {
    this.sweep();
    const row = this.records.get(id);
    if (!row)
      throw new TableError(
        "DRAW_NOT_FOUND",
        404,
        "Расклад истёк. Начни новый.",
      );
    if (
      !Array.isArray(selected) ||
      selected.length !== row.begin.requiredCount ||
      selected.some((s) => typeof s !== "string" || !row.slots.has(s)) ||
      new Set(selected).size !== selected.length
    )
      throw new TableError(
        "INVALID_SELECTION",
        400,
        "Выбери нужное число разных карт из этой колоды.",
      );
    if (row.selected) {
      if (JSON.stringify(selected) !== JSON.stringify(row.selected))
        throw new TableError(
          "DRAW_ALREADY_CONFIRMED",
          409,
          "Этот расклад уже подтверждён с другим выбором.",
        );
      return row.result!;
    }
    const cards: PositionedCard[] = selected.map((s, i) => ({
      ...row.slots.get(s)!,
      displayName: row.slots.get(s)!.name,
      position: row.begin.positions[i].name,
      positionMeaning: row.begin.positions[i].meaning,
    }));
    const reading = {
      readingId: "reading_" + randomUUID(),
      drawId: id,
      deckId: row.begin.deckId,
      deckName: row.begin.deckName,
      spreadType: row.begin.spreadType,
      spreadName: row.begin.spreadName,
      question: row.begin.question,
      language: row.begin.language,
      timestamp: new Date(this.now()).toISOString(),
      cards,
      interpretation: interpretSystem(
        row.begin.deckId,
        cards,
        row.begin.language,
      ),
      rulesVersion: "kod-dushi-systems-2026-10-20",
      sources:
        row.begin.deckId === "lenormand-classic"
          ? [
              "https://labyrinthos.co/blogs/lenormand-cards/the-heart-lenormand-card-meaning-and-combinations",
              "https://labyrinthos.co/blogs/lenormand-cards/the-ring-lenormand-card-meaning-and-combinations",
            ]
          : [],
    };
    row.selected = selected;
    row.result = reading;
    return reading;
  }
}
