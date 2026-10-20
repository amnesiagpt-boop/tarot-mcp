import { useEffect, useState } from "react";
import { DECKS } from "@tarot/shared/decks.js";
import {
  deleteReading,
  importReadings,
  migrateLegacyReadings,
  readReadings,
  type SavedReading,
} from "./reading-archive.js";
import { ReadingBoard } from "./ReadingBoard.js";
import { ThemedSelect } from "./ThemedSelect.js";
import type { DrawClient } from "./types.js";
export function ReadingArchive({ client }: { client: DrawClient }) {
  const [rows, setRows] = useState<SavedReading[]>([]),
    [loaded, setLoaded] = useState(false),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [removeId, setRemoveId] = useState<string>();
  const selectedId = new URLSearchParams(location.search).get("id");
  const [pageSize, setPageSize] = useState(() =>
    matchMedia("(max-width:650px)").matches
      ? matchMedia("(max-height:730px)").matches
        ? 2
        : 4
      : 8,
  );
  useEffect(() => {
    document.title = "Мои расклады — Код души";
    const narrow = matchMedia("(max-width:650px)"),
      short = matchMedia("(max-height:730px)");
    const change = () => {
      setPageSize(narrow.matches ? (short.matches ? 2 : 4) : 8);
      setPage(0);
    };
    narrow.addEventListener("change", change);
    short.addEventListener("change", change);
    return () => {
      narrow.removeEventListener("change", change);
      short.removeEventListener("change", change);
    };
  }, []);
  async function refresh() {
    try {
      await migrateLegacyReadings();
      setRows(await readReadings());
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Не удалось открыть архив.");
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const selected = rows.find((row) => row.id === selectedId);
  if (selected)
    return (
      <>
        <a className="archive-return" href="/draw/?view=readings">
          ← Мои расклады
        </a>
        <ReadingBoard
          reading={selected.reading}
          client={client}
          language={selected.reading.language}
          onRestart={() => location.assign("/draw/")}
          initialRevealedIndices={selected.reading.cards.map((_, i) => i)}
        />
      </>
    );
  const visible = rows.filter(
    (r) =>
      (filter === "all" || r.reading.deckId === filter) &&
      [r.reading.question, r.reading.spreadName, r.reading.deckName]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const size = pageSize,
    pages = Math.max(1, Math.ceil(visible.length / size));
  const current = Math.min(page, pages - 1);
  function exportArchive() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, readings: rows }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "kod-dushi-readings.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main className="reading-archive">
      <div className="archive-heading">
        <div>
          <p className="setup-eyebrow">Личное пространство</p>
          <h1>Мои расклады</h1>
          <p>Сохранённые карты, вопросы и трактовки. Всего: {rows.length}.</p>
        </div>
        <a className="primary-action" href="/draw/">
          Новый расклад →
        </a>
      </div>
      <div className="archive-controls">
        <label>
          Поиск
          <input
            type="search"
            value={search}
            placeholder="Вопрос или название расклада"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          Колода
          <ThemedSelect
            aria-label="Колода"
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(0);
            }}
          >
            <option value="all">Все колоды</option>
            {DECKS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </ThemedSelect>
        </label>
        <button
          className="text-action"
          onClick={exportArchive}
          disabled={!rows.length}
        >
          Скачать архив
        </button>
        <label className="archive-import">
          Импорт архива
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 20 * 1024 * 1024)
                  throw new Error("Максимальный размер файла20МБ.");
                const count = await importReadings(
                  JSON.parse(await file.text()),
                );
                setNotice(`Загружено раскладов: ${count}.`);
                await refresh();
              } catch (error) {
                setNotice(
                  error instanceof Error
                    ? error.message
                    : "Не удалось импортировать файл.",
                );
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="archive-storage-note">
        Хранится в этом браузере. Чтобы перенести расклады на другое устройство
        или новый адрес сайта, скачай архив. Облачный аккаунт пока не подключён.
      </p>
      <p role="status">{notice}</p>
      {!loaded ? (
        <p>Открываем архив…</p>
      ) : !visible.length ? (
        <div className="archive-empty">
          <h2>
            {rows.length ? "Ничего не найдено" : "Здесь появятся твои расклады"}
          </h2>
          <p>
            После раскрытия карт нажми «Сохранить расклад». Уже сохранённые
            результаты останутся доступными при следующих посещениях этого
            адреса.
          </p>
        </div>
      ) : (
        <div className="archive-grid">
          {visible.slice(current * size, (current + 1) * size).map((row) => (
            <article className="archive-item" key={row.id}>
              <a href={"/draw/?view=readings&id=" + encodeURIComponent(row.id)}>
                <div className="archive-mini-cards" aria-hidden="true">
                  {row.reading.cards.slice(0, 3).map((c, i) => (
                    <img src={c.imageUri} key={i} alt="" loading="lazy" />
                  ))}
                </div>
                <small>
                  {row.reading.deckName} ·{" "}
                  {new Date(
                    row.reading.timestamp ?? row.savedAt,
                  ).toLocaleString("ru-RU")}
                </small>
                <h2>{row.reading.spreadName}</h2>
                <p>{row.reading.question || "Без отдельного вопроса"}</p>
              </a>
              {removeId === row.id ? (
                <div className="archive-delete">
                  <span>Удалить этот расклад?</span>
                  <button
                    onClick={async () => {
                      try {
                        await deleteReading(row.id);
                        const old = JSON.parse(
                          localStorage.getItem("kod-dushi:tarot:v1") ?? "[]",
                        );
                        if (Array.isArray(old))
                          localStorage.setItem(
                            "kod-dushi:tarot:v1",
                            JSON.stringify(old.filter((r) => r.id !== row.id)),
                          );
                        setRemoveId(undefined);
                        await refresh();
                      } catch {
                        setNotice("Не удалось удалить расклад.");
                      }
                    }}
                  >
                    Да, удалить
                  </button>
                  <button onClick={() => setRemoveId(undefined)}>Отмена</button>
                </div>
              ) : (
                <button
                  className="text-action archive-remove"
                  onClick={() => setRemoveId(row.id)}
                >
                  Удалить
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {pages > 1 ? (
        <nav className="archive-pages" aria-label="Страницы архива">
          <button
            className="text-action"
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            ← Назад
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            className="text-action"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Далее →
          </button>
        </nav>
      ) : null}
    </main>
  );
}
