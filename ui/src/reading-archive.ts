import type { ConfirmedReading, ReadingCard } from "./types.js";
import { createClientUuid } from "./client-uuid.js";
import {
  canonicalTarotId,
  cardImage,
  getDeck,
  type DeckId,
} from "@tarot/shared/decks.js";
export interface SavedReading {
  id: string;
  savedAt: string;
  reading: ConfirmedReading;
}
const DB = "kod-dushi-readings",
  STORE = "readings";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Хранилище браузера недоступно."));
      return;
    }
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Не удалось открыть архив."));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let request: IDBRequest<T>;
    try {
      request = operation(tx.objectStore(STORE));
    } catch (e) {
      db.close();
      reject(e);
      return;
    }
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(
        tx.error ?? request.error ?? new Error("Не удалось сохранить архив."),
      );
    };
  });
}
function safeCard(value: ReadingCard, deckId: DeckId): ReadingCard {
  const id =
    deckId === "tarot-classic"
      ? canonicalTarotId(value)
      : String(value.id).replace(/[^a-z0-9_]/gi, "");
  return {
    id,
    name: String(value.name),
    displayName: String(value.displayName ?? value.name),
    orientation: value.orientation === "reversed" ? "reversed" : "upright",
    position: typeof value.position === "string" ? value.position : undefined,
    positionMeaning:
      typeof value.positionMeaning === "string"
        ? value.positionMeaning
        : undefined,
    meaning: typeof value.meaning === "string" ? value.meaning : undefined,
    keywords: Array.isArray(value.keywords)
      ? value.keywords.filter((k) => typeof k === "string")
      : undefined,
    imageUri: cardImage(deckId, id),
  };
}
export function archiveSnapshot(reading: ConfirmedReading): ConfirmedReading {
  if (
    !reading ||
    typeof reading !== "object" ||
    !Array.isArray(reading.cards) ||
    reading.cards.length < 1 ||
    reading.cards.length > 78 ||
    reading.cards.some(
      (c) => !c || typeof c.id !== "string" || typeof c.name !== "string",
    )
  )
    throw new Error("В файле нет корректного расклада.");
  let deck;
  try {
    deck = getDeck(reading.deckId);
  } catch {
    deck = getDeck();
  }
  return {
    readingId: reading.readingId,
    spreadType: String(reading.spreadType ?? "three_card"),
    spreadName: String(reading.spreadName ?? "Расклад"),
    question: String(reading.question ?? ""),
    language: ["ru", "en", "zh"].includes(reading.language)
      ? reading.language
      : "ru",
    timestamp: reading.timestamp ?? new Date().toISOString(),
    deckId: deck.id,
    deckName: deck.name,
    cards: reading.cards.map((card) => safeCard(card, deck.id)),
    interpretation: String(reading.interpretation ?? ""),
    rulesVersion: reading.rulesVersion,
    sources: Array.isArray(reading.sources)
      ? reading.sources.filter((s) => typeof s === "string")
      : undefined,
  };
}
export async function saveReading(reading: ConfirmedReading): Promise<string> {
  const id =
    reading.readingId ??
    reading.drawId ??
    JSON.stringify([
      reading.timestamp,
      reading.question,
      reading.cards.map((c) => c.id),
    ]);
  const row: SavedReading = {
    id,
    savedAt: new Date().toISOString(),
    reading: archiveSnapshot(reading),
  };
  await transaction("readwrite", (store) => store.put(row));
  return id;
}
export async function readReadings(): Promise<SavedReading[]> {
  return (
    await transaction<SavedReading[]>("readonly", (store) => store.getAll())
  ).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
export async function deleteReading(id: string): Promise<void> {
  await transaction("readwrite", (store) => store.delete(id));
}
export async function hasReading(reading: ConfirmedReading): Promise<boolean> {
  const id = reading.readingId ?? reading.drawId;
  if (!id) return false;
  return Boolean(await transaction("readonly", (store) => store.getKey(id)));
}
/** Import existing explicitly saved provider readings; never cut the list to ten. */
export async function migrateLegacyReadings() {
  let rows: unknown;
  let migrated: Set<string>;
  try {
    rows = JSON.parse(localStorage.getItem("kod-dushi:tarot:v1") ?? "[]");
    const ids: unknown = JSON.parse(
      localStorage.getItem("kod-dushi:tarot:migrated:v1") ?? "[]",
    );
    migrated = new Set(
      Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [],
    );
  } catch {
    return;
  }
  if (!Array.isArray(rows)) return;
  const existing = new Set((await readReadings()).map((r) => r.id));
  for (const row of rows) {
    if (
      !row ||
      typeof row.id !== "string" ||
      migrated.has(row.id) ||
      !Array.isArray(row.positions) ||
      row.positions.length !== 3 ||
      row.positions.some(
        (p: { card?: unknown } | null) =>
          !p || !p.card || typeof p.card !== "object",
      )
    )
      continue;
    if (existing.has(row.id)) {
      migrated.add(row.id);
      localStorage.setItem(
        "kod-dushi:tarot:migrated:v1",
        JSON.stringify([...migrated]),
      );
      continue;
    }
    const cards: ReadingCard[] = row.positions.map(
      (p: {
        card: { id?: string; name?: string };
        title?: string;
        meaning?: string;
        isReversed?: boolean;
      }) => {
        const id = canonicalTarotId(p.card);
        return {
          id,
          name: p.card.name ?? id,
          displayName: p.card.name ?? id,
          position: p.title,
          meaning: p.meaning,
          orientation: p.isReversed ? "reversed" : "upright",
          imageUri: `/assets/cards/midnight-art-nouveau-v1/${id}.webp`,
        };
      },
    );
    await saveReading({
      readingId: row.id,
      deckId: "tarot-classic",
      spreadType: "three_card",
      spreadName: "Три карты",
      question: "",
      language: "ru",
      timestamp: row.calculatedAt,
      cards,
      interpretation: cards
        .map((c) => `### ${c.position} — ${c.displayName}\n\n${c.meaning}`)
        .join("\n\n"),
    });
    // Deleting the imported archive entry must not import it again on refresh.
    migrated.add(row.id);
    localStorage.setItem(
      "kod-dushi:tarot:migrated:v1",
      JSON.stringify([...migrated]),
    );
  }
}
export async function importReadings(value: unknown): Promise<number> {
  if (
    !value ||
    typeof value !== "object" ||
    !("readings" in value) ||
    !Array.isArray(value.readings)
  )
    throw new Error("Выбери файл архива раскладов «Кода души».");
  const existing = new Set((await readReadings()).map((r) => r.id));
  const rows = value.readings
    .map((r: SavedReading) => {
      if (!r || typeof r !== "object")
        throw new Error("В файле есть некорректная запись расклада.");
      return {
        id: typeof r.id === "string" ? r.id : createClientUuid(),
        savedAt:
          typeof r.savedAt === "string" ? r.savedAt : new Date().toISOString(),
        reading: archiveSnapshot(r.reading),
      };
    })
    .filter((row) => {
      if (existing.has(row.id)) return false;
      existing.add(row.id);
      return true;
    });
  if (rows.length)
    await transaction("readwrite", (store) => {
      for (const row of rows.slice(0, -1)) store.put(row);
      return store.put(rows[rows.length - 1]);
    });
  return rows.length;
}
