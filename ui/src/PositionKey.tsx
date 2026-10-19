import { t } from "./i18n.js";
import { useEffect, useState } from "react";
import type { Language } from "./types.js";

export interface PositionAction {
  /** Accessible name of the item's button; it must name the whole action. */
  label: string;
  onActivate(): void;
  disabled?: boolean;
}

/**
 * The numbered index of spread positions beneath the cloth. Every position is
 * reachable here at a full-size target, so dense or overlapping layouts never
 * depend on hitting a small card. Values and actions are read by position
 * index; a position without either is plain text.
 */
export function PositionKey({
  language,
  names,
  values,
  actions,
  pageSize,
  activeIndex,
}: {
  language: Language;
  names: string[];
  values?: Array<string | undefined>;
  actions?: Array<PositionAction | undefined>;
  pageSize?: number;
  activeIndex?: number;
}) {
  const [narrow, setNarrow] = useState(() => window.matchMedia?.("(max-width:650px)").matches ?? false);
  const [page, setPage] = useState(0);
  const size = pageSize ? (narrow ? 3 : pageSize) : names.length;
  const count = Math.max(1, Math.ceil(names.length / Math.max(1, size)));
  const current = Math.min(page, count - 1);
  useEffect(() => {
    const media = window.matchMedia?.("(max-width:650px)");
    if (!media) return;
    const resize = () => setNarrow(media.matches);
    if (media.addEventListener) {
      media.addEventListener("change", resize);
      return () => media.removeEventListener("change", resize);
    }
    media.addListener?.(resize);
    return () => media.removeListener?.(resize);
  }, []);
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0) setPage(Math.floor(activeIndex / Math.max(1, size)));
  }, [activeIndex, size]);
  return (
    <div className="position-key-wrap">
    <ol className="position-key" aria-label={t(language, "spreadPositions")}>
      {names.slice(current * size, (current + 1) * size).map((name, offset) => {
        const index = current * size + offset;
        const value = values?.[index];
        const action = actions?.[index];
        const content = (
          <>
            <span className="position-key__number">{index + 1}</span>
            <span className="position-key__name">{name}</span>
            {value ? (
              <span className="position-key__value">{value}</span>
            ) : null}
          </>
        );
        return (
          <li key={`${name}-${index}`}>
            {action ? (
              <button
                type="button"
                className="position-key__action"
                aria-label={action.label}
                disabled={action.disabled}
                onClick={() => action.onActivate()}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ol>
    {count > 1 ? <div className="position-pages" aria-label={t(language, "spreadPositions")}>
      <button type="button" aria-label={language === "ru" ? "Предыдущие позиции" : language === "zh" ? "上一组牌位" : "Previous positions"} disabled={current === 0} onClick={() => setPage(current - 1)}>←</button>
      <span aria-live="polite">{current + 1} / {count}</span>
      <button type="button" aria-label={language === "ru" ? "Следующие позиции" : language === "zh" ? "下一组牌位" : "Next positions"} disabled={current + 1 >= count} onClick={() => setPage(current + 1)}>→</button>
    </div> : null}
    </div>
  );
}
