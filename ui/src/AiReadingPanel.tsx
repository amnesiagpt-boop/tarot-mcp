import { useEffect, useRef, useState } from "react";
import { ReadingInterpretation } from "./ReadingInterpretation.js";
import type { ConfirmedReading } from "./types.js";

type Mode = "standard" | "deep";
type RequestState = "idle" | "working" | "done" | "error";

function payloadFor(reading: ConfirmedReading, mode: Mode) {
  return {
    mode,
    deckId: reading.deckId,
    question: reading.question,
    spreadName: reading.spreadName,
    spreadType: reading.spreadType,
    cards: reading.cards.map((card) => ({
      id: card.id,
      orientation: card.orientation,
      position: card.position || "",
      positionMeaning: card.positionMeaning || "",
    })),
  };
}

export function AiReadingPanel({ reading }: { reading: ConfirmedReading }) {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<RequestState>("idle");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Mode>("standard");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (reading.deckId !== "tarot-classic") return;
    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch("/api/ai/health", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled && response.ok && data.enabled === true) setAvailable(true);
      } catch { /* Keep the existing non-AI interpretation usable. */ }
    };
    void check();
    return () => { cancelled = true; controller.current?.abort(); };
  }, [reading.deckId]);

  async function generate(mode: Mode) {
    if (status === "working") return;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setSelected(mode);
    setContent("");
    setError("");
    setStatus("working");
    try {
      const response = await fetch("/api/ai/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFor(reading, mode)),
        signal: next.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Не удалось создать трактовку.");
      }
      if (!response.body) throw new Error("Браузер не поддерживает потоковую загрузку.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
        let index;
        while ((index = buffer.indexOf("\n\n")) !== -1) {
          const event = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          const lines = event.split("\n");
          const eventName = lines.find((line) => line.startsWith("event: "))?.slice(7);
          const dataLine = lines.find((line) => line.startsWith("data: "));
          if (!dataLine) continue;
          let data: { text?: string; error?: string };
          try { data = JSON.parse(dataLine.slice(6)); } catch { continue; }
          if (eventName === "delta" && data.text) setContent((current) => current + data.text);
          if (eventName === "done") completed = true;
          if (eventName === "error") throw new Error(data.error || "Генерация прервана.");
        }
      }
      if (!completed) throw new Error("Поток завершился до окончания трактовки.");
      setStatus("done");
    } catch (exception) {
      if (next.signal.aborted) return;
      setError(exception instanceof Error ? exception.message : "Не удалось создать трактовку.");
      setStatus("error");
    }
  }

  if (!available) return null;
  return (
    <section className="ai-reading-panel" aria-labelledby="ai-reading-title">
      <div className="ai-reading-panel__intro">
        <p className="ai-reading-panel__eyebrow">Персональное прочтение</p>
        <h3 id="ai-reading-title">Трактовка с GPT</h3>
        <p>GPT связывает значения карт с их позициями и твоим вопросом.
           Это символическая интерпретация, а не достоверный прогноз событий.</p>
        <p className="ai-reading-panel__consent">
          При запуске вопрос и выбранные карты отправятся в OpenAI для формирования ответа.
          Не указывай в вопросе личные данные, которые не хочешь передавать.
        </p>
      </div>
      <div className="ai-reading-panel__actions">
        <button className="primary-action" type="button"
          disabled={status === "working"} onClick={() => void generate("standard")}>
          {status === "working" && selected === "standard" ? "Готовим объяснение…" : "Обычная трактовка"}
        </button>
        <button className="secondary-action" type="button"
          disabled={status === "working"} onClick={() => void generate("deep")}>
          {status === "working" && selected === "deep" ? "Анализируем расклад…" : "Глубокая трактовка"}
        </button>
      </div>
      {status === "working" ? (
        <p role="status" aria-live="polite">GPT анализирует сочетания карт. Текст появится постепенно.</p>
      ) : null}
      {status === "error" ? <p role="alert" className="ai-reading-panel__error">{error}</p> : null}
      {content ? (
        <div className="ai-reading-panel__result">
          <h4>{selected === "deep" ? "Глубокое прочтение" : "Прочтение расклада"}</h4>
          <ReadingInterpretation text={content} />
          {status === "done" ? (
            <button className="text-action" type="button"
              onClick={() => void navigator.clipboard.writeText(content)}>
              Скопировать трактовку
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
