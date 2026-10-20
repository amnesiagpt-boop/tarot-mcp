import { ThemedSelect } from "./ThemedSelect.js";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { getSpreadPickerCatalog } from "@tarot/readings/spread-localizations.js";
import { SetupShell } from "./SetupShell.js";
import { ConnectionSettings } from "./ConnectionSettings.js";
import { PositionKey } from "./PositionKey.js";
import { t } from "./i18n.js";
import { DECKS, getDeck, type DeckId } from "@tarot/shared/decks.js";
import { getTableSpreads } from "./table-spreads.js";
import type {
  BeginReadingInput,
  DrawClient,
  Language,
  ReadingKind,
} from "./types.js";

function parseCustomPositions(value: string): string[] {
  return value
    .split("\n")
    .map((position) => position.trim())
    .filter(Boolean);
}

export function SetupForm({
  language,
  client,
  onLanguageChange,
  onSubmit,
  isPending,
  notice,
}: {
  language: Language;
  client: DrawClient;
  onLanguageChange(language: Language): void;
  onSubmit(input: BeginReadingInput): void;
  isPending: boolean;
  /** Recovery or error notice, shown above the submit button in document flow. */
  notice?: ReactNode;
}) {
  const [question, setQuestion] = useState("");
  const [deckId, setDeckId] = useState<DeckId>("tarot-classic");
  const [reversalsEnabled, setReversalsEnabled] = useState(false);
  const deck = getDeck(deckId);
  const [readingKind, setReadingKind] = useState<ReadingKind>("spread");
  const [spreadType, setSpreadType] = useState("three_card");
  const [customDate, setCustomDate] = useState("");
  const [customName, setCustomName] = useState("");
  const [customPositions, setCustomPositions] = useState("");
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const positionsRef = useRef<HTMLTextAreaElement>(null);
  const [invalidField, setInvalidField] = useState<"question" | "positions">();
  const catalog =
    deck.system === "tarot"
      ? getSpreadPickerCatalog(language)
      : getTableSpreads(language);
  const preview = catalog.find(
    (spread) =>
      spread.id === (readingKind === "daily" ? "daily_guidance" : spreadType),
  );

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    if (readingKind !== "daily" && !question.trim()) {
      setInvalidField("question");
      questionRef.current?.focus();
      return;
    }
    const positions = parseCustomPositions(customPositions);
    if (
      readingKind === "custom" &&
      (positions.length < 1 || positions.length > 15)
    ) {
      setInvalidField("positions");
      positionsRef.current?.focus();
      return;
    }
    setInvalidField(undefined);
    const normalizedQuestion = question.trim();
    const tableOptions =
      client.target === "web"
        ? {
            deckId,
            reversalsEnabled:
              deck.system === "tarot" &&
              readingKind !== "moon" &&
              reversalsEnabled,
            tablePositions: preview?.positions.map((p) => ({
              name: p.name,
              meaning: p.meaning,
            })),
            tableSpreadName: preview?.name,
          }
        : {};
    if (readingKind === "daily") {
      onSubmit({
        ...tableOptions,
        readingKind,
        language,
        ...(normalizedQuestion ? { question: normalizedQuestion } : {}),
      });
    } else if (readingKind === "moon") {
      onSubmit({
        ...tableOptions,
        readingKind,
        question: normalizedQuestion,
        language,
        ...(customDate ? { customDate } : {}),
      });
    } else if (readingKind === "custom") {
      onSubmit({
        ...tableOptions,
        readingKind,
        question: normalizedQuestion,
        language,
        customSpread: {
          name: customName.trim() || t(language, "custom"),
          positions: positions.map((name) => ({ name, meaning: "" })),
        },
      });
    } else {
      onSubmit({
        ...tableOptions,
        readingKind,
        spreadType,
        question: normalizedQuestion,
        language,
      });
    }
  };

  return (
    <SetupShell
      language={language}
      client={client}
      onLanguageChange={onLanguageChange}
      spreadCount={catalog.length}
      deckId={deckId}
    >
      <form
        id="reading-form"
        className="setup-form"
        onSubmit={submit}
        noValidate
        aria-busy={isPending}
      >
        <fieldset className="reading-kind-switch">
          <legend>{t(language, "readingKind")}</legend>
          {(["spread", "daily", "moon", "custom"] as const)
            .filter((kind) => deck.system === "tarot" || kind !== "moon")
            .map((kind) => (
              <label key={kind}>
                <input
                  type="radio"
                  name="reading-kind"
                  value={kind}
                  checked={readingKind === kind}
                  onChange={() => {
                    setReadingKind(kind);
                    setInvalidField(undefined);
                  }}
                />
                <span>
                  {t(
                    language,
                    kind === "spread"
                      ? "kindSpread"
                      : kind === "daily"
                        ? "kindDaily"
                        : kind === "moon"
                          ? "kindMoon"
                          : "kindCustom",
                  )}
                </span>
              </label>
            ))}
        </fieldset>
        {client.target === "web" ? (
          <div className="field field--wide deck-picker">
            <span>{language === "ru" ? "Колода" : "Deck"}</span>
            <ThemedSelect
              aria-label={language === "ru" ? "Колода" : "Deck"}
              value={deckId}
              onValueChange={(value) => {
                setDeckId(value as DeckId);
                setSpreadType("three_card");
                setReversalsEnabled(false);
                if (readingKind === "moon") setReadingKind("spread");
              }}
            >
              {DECKS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.size}
                </option>
              ))}
            </ThemedSelect>
            <small className="deck-description">{deck.description}</small>
          </div>
        ) : null}
        <label className="field field--wide">
          <span>{t(language, "question")}</span>
          <textarea
            ref={questionRef}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (invalidField === "question") setInvalidField(undefined);
            }}
            placeholder={t(language, "questionPlaceholder")}
            rows={2}
            maxLength={2000}
            required={readingKind !== "daily"}
            aria-invalid={invalidField === "question"}
            aria-describedby={
              invalidField === "question" ? "setup-error" : undefined
            }
          />
        </label>
        {readingKind === "spread" ? (
          <div className="field field--wide">
            <span>{t(language, "spread")}</span>
            <ThemedSelect
              value={spreadType}
              aria-label={t(language, "spread")}
              aria-describedby="spread-description"
              onValueChange={setSpreadType}
            >
              {catalog.map((spread) => (
                <option key={spread.id} value={spread.id}>
                  {spread.name} · {spread.cardCount}
                </option>
              ))}
            </ThemedSelect>
          </div>
        ) : null}
        {client.target === "web" &&
        deck.system === "tarot" &&
        readingKind !== "moon" ? (
          <label className="reversals-option">
            <input
              type="checkbox"
              checked={reversalsEnabled}
              onChange={(e) => setReversalsEnabled(e.target.checked)}
            />
            {language === "ru"
              ? "Использовать перевёрнутые значения"
              : "Use reversed meanings"}
          </label>
        ) : null}
        {(readingKind === "spread" || readingKind === "daily") && preview ? (
          <div className="spread-preview">
            <p id="spread-description">{preview.description}</p>
            <PositionKey
              key={preview.id}
              language={language}
              names={preview.positions.map((position) => position.name)}
              pageSize={6}
            />
          </div>
        ) : null}
        {readingKind === "moon" ? (
          <label className="field field--wide">
            <span>{t(language, "moonDate")}</span>
            <input
              type="date"
              value={customDate}
              onChange={(event) => setCustomDate(event.target.value)}
            />
          </label>
        ) : null}
        {readingKind === "custom" ? (
          <>
            <label className="field field--wide">
              <span>{t(language, "customName")}</span>
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder={t(language, "customNamePlaceholder")}
                maxLength={100}
              />
            </label>
            <label className="field field--wide">
              <span>{t(language, "customPositions")}</span>
              <textarea
                ref={positionsRef}
                value={customPositions}
                onChange={(event) => {
                  setCustomPositions(event.target.value);
                  if (invalidField === "positions") setInvalidField(undefined);
                }}
                placeholder={t(language, "customPositionsPlaceholder")}
                rows={4}
                aria-invalid={invalidField === "positions"}
                aria-describedby={
                  invalidField === "positions" ? "setup-error" : undefined
                }
              />
            </label>
          </>
        ) : null}
        {invalidField ? (
          <p id="setup-error" className="form-error" role="alert">
            {t(
              language,
              invalidField === "question" ? "required" : "positionRange",
            )}
          </p>
        ) : null}
        {notice}
        <button
          className="primary-action field--wide"
          type="submit"
          disabled={isPending}
        >
          <span>
            {isPending ? t(language, "beginning") : t(language, "begin")}
          </span>
          <span aria-hidden="true">↗</span>
        </button>
        <p className="setup-note">{t(language, "choiceNote")}</p>
      </form>
      <ConnectionSettings client={client} language={language} />
    </SetupShell>
  );
}
