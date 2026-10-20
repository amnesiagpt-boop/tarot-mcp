import { ThemedSelect } from "./ThemedSelect.js";
import type { ReactNode } from "react";
import { VISUAL_CARD_ASSET_BASE } from "@tarot/shared/artwork.js";
import { t } from "./i18n.js";
import { RitualProgress } from "./RitualProgress.js";
import type { DrawClient, Language } from "./types.js";
import { getDeck, type DeckId } from "@tarot/shared/decks.js";

/** Page identity and responsive composition, independent of form state. */
export function SetupShell({
  language,
  client,
  onLanguageChange,
  spreadCount,
  deckId = "tarot-classic",
  children,
}: {
  language: Language;
  client: DrawClient;
  onLanguageChange(language: Language): void;
  spreadCount: number;
  deckId?: DeckId;
  children: ReactNode;
}) {
  return (
    <div className="setup-shell">
      <a className="skip-link" href="#reading-form">
        {t(language, "skipToForm")}
      </a>
      <RitualProgress current="intention" language={language} />
      <div className="setup-header">
        {client.target === "mcp" ? (
          <span className="wordmark">
            {language === "ru" ? "Таро" : "Tarot"}
          </span>
        ) : (
          <a
            className="wordmark"
            href="/draw/"
            aria-label={language === "ru" ? "Таро" : "Tarot"}
          >
            <span aria-hidden="true">✦</span>{" "}
            {language === "ru" ? "Таро" : "Tarot"}
          </a>
        )}
        <div className="language-picker">
          <span className="sr-only">{t(language, "language")}</span>
          <ThemedSelect
            aria-label={t(language, "language")}
            value={language}
            onValueChange={(value) => onLanguageChange(value as Language)}
          >
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </ThemedSelect>
        </div>
      </div>
      <main className="setup-layout">
        <section className="setup-intro" aria-labelledby="setup-title">
          <p className="setup-eyebrow">{getDeck(deckId).name}</p>
          <h1 id="setup-title">{t(language, "title")}</h1>
          <p className="setup-subtitle">{t(language, "subtitle")}</p>
          <figure className="deck-preview">
            {client.target === "web" ? (
              <div
                className="deck-preview__cards deck-preview__cards--balanced"
                aria-hidden="true"
              >
                {getDeck(deckId).preview.map((cardId) => (
                  <img
                    key={`${deckId}:${cardId}`}
                    className="deck-preview__sample"
                    src={`${getDeck(deckId).assetBase}/${cardId}.webp?v=classic-20261020`}
                    width="400"
                    height="650"
                    alt=""
                  />
                ))}
              </div>
            ) : (
              <div className="deck-preview__cards" aria-hidden="true">
                {(["moon", "back", "star"] as const).map((cardId) => {
                  // Reuse the theme's artwork without duplicating it in the MCP HTML.
                  if (cardId === "back") {
                    return <span key={cardId} className="deck-preview__back" />;
                  }
                  const source =
                    client.target === "mcp"
                      ? client.getPreviewImage?.(cardId)
                      : `${VISUAL_CARD_ASSET_BASE}/${cardId}.webp?v=classic-20261020`;
                  return source ? (
                    <img
                      key={cardId}
                      className={`deck-preview__${cardId}`}
                      src={source}
                      width="512"
                      height="768"
                      alt=""
                    />
                  ) : null;
                })}
              </div>
            )}
          </figure>
        </section>
        <section className="setup-panel" aria-labelledby="form-title">
          <div className="setup-panel__heading">
            <h2 id="form-title">{t(language, "prepareReading")}</h2>
            <span>{t(language, "spreadCount", { count: spreadCount })}</span>
          </div>
          {children}
        </section>
      </main>
      <footer className="setup-footer">
        <span>{t(language, "reflectionNote")}</span>
      </footer>
    </div>
  );
}
