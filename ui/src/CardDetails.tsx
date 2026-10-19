import { useEffect, useRef } from "react";
import { t } from "./i18n.js";
import type { DrawClient, Language, ReadingCard } from "./types.js";
import { useCardImage } from "./useCardImage.js";

export function CardDetails({
  card,
  client,
  language,
  onClose,
}: {
  card: ReadingCard;
  client: DrawClient;
  language: Language;
  onClose(): void;
}) {
  const [source] = useCardImage(client, card);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    closeButton.current?.focus();
    const handleDialogKeys = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
    };
    window.addEventListener("keydown", handleDialogKeys);
    return () => {
      window.removeEventListener("keydown", handleDialogKeys);
    };
  }, [onClose]);

  return (
      <main
        className="card-detail-page"
        aria-labelledby="card-dialog-title"
      >
        <button
          ref={closeButton}
          type="button"
          className="card-detail-back text-action"
          onClick={onClose}
          aria-label={t(language, "close")}
        >
          ← {language === "ru" ? "К раскладу" : language === "zh" ? "返回牌阵" : "Back to reading"}
        </button>
        <div className="dialog-art">
          {source ? (
            <img
              src={source}
              alt={card.displayName}
              className={card.orientation === "reversed" ? "is-reversed" : ""}
            />
          ) : (
            <div className="card-art-fallback">{card.displayName}</div>
          )}
        </div>
        <div className="dialog-copy">
          <p className="position-label">{card.position}</p>
          <h2 id="card-dialog-title">{card.displayName}</h2>
          <p className="orientation-label">
            {card.orientation === "reversed"
              ? t(language, "reversed")
              : t(language, "upright")}
          </p>
          {card.positionMeaning ? <p>{card.positionMeaning}</p> : null}
          {card.meaning ? <p>{card.meaning}</p> : null}
          {card.keywords?.length ? (
            <ul className="keyword-list">
              {card.keywords.map((keyword) => (
                <li key={keyword}>{keyword}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
  );
}
