import type { DrawError, Language } from "./types.js";

const RUSSIAN_ERRORS: Record<string, string> = {
  IDEMPOTENCY_CONFLICT:
    "Этот запрос уже использован с другими настройками. Начни новый расклад.",
  DRAW_CAPACITY_REACHED:
    "Все места за карточным столом заняты. Повтори попытку, когда завершится один из текущих раскладов.",
  DRAW_NOT_FOUND: "Расклад не найден. Начни новый расклад.",
  DRAW_EXPIRED: "Время работы с этой колодой истекло. Начни новый расклад.",
  DRAW_ALREADY_CONFIRMED:
    "Эта колода уже подтверждена с другим выбором. Начни новый расклад.",
  DRAW_ALREADY_CONFIRMING:
    "Для этой колоды уже подтверждается другой выбор. Дождись завершения.",
  INVALID_SELECTION_COUNT:
    "Выбери ровно столько карт, сколько позиций в раскладе.",
  DUPLICATE_SLOT: "Каждую карту можно выбрать только один раз.",
  INVALID_SLOT:
    "Одна из выбранных карт не принадлежит этой колоде. Начни новый расклад.",
  INVALID_CUSTOM_SPREAD: "Проверь название и позиции своего расклада.",
};
const FIXED: Record<string, string> = {
  "Missing draw data": "Нет данных колоды. Начни новый расклад.",
  "The server did not return a drawId.":
    "Сервер не вернул номер расклада. Повтори попытку.",
  "A reading is already in progress. Finish it or start a new reading from the table.":
    "Расклад уже начат. Заверши его или начни новый за карточным столом.",
  "The visual-reading handoff has expired.":
    "Время передачи расклада истекло. Начни новый расклад.",
  "The host rejected the interpretation request.":
    "Чат отклонил запрос на толкование.",
  "The host interpretation request timed out.":
    "Чат не ответил на запрос толкования вовремя.",
};

/** Translate at the presentation boundary, preserving machine-readable errors
 * for retry/recovery and never displaying untranslated transport diagnostics. */
export function errorCopy(
  error: Pick<DrawError, "message" | "code" | "httpStatus">,
  language: Language,
): string {
  if (language !== "ru") return error.message;
  if (error.code && RUSSIAN_ERRORS[error.code])
    return RUSSIAN_ERRORS[error.code];
  if (FIXED[error.message]) return FIXED[error.message];
  if (/[А-Яа-яЁё]/.test(error.message)) return error.message;
  const count = error.message.match(/^Expected (\d+) cards, received (\d+)\.$/);
  if (count)
    return `Ожидалось карт: ${count[1]}, получено: ${count[2]}. Повтори подтверждение.`;
  if (error.message.includes("78 opaque card slots"))
    return "Сервер ещё не передал все 78 закрытых карт. Если колода не появится, начни новый расклад.";
  if (error.message.includes("generated card-back artwork"))
    return "Сервер ещё не передал изображение рубашки карт. Если оно не появится, начни новый расклад.";
  if (/fetch|network|connection|connect/i.test(error.message))
    return "Нет связи с карточным столом. Проверь подключение и повтори попытку.";
  if (/timeout|timed out|abort/i.test(error.message))
    return "Время ожидания истекло. Проверь результат перед повторной попыткой.";
  if (error.httpStatus === 401 || error.httpStatus === 403)
    return "Нет доступа к карточному столу. Проверь настройки подключения.";
  if (error.httpStatus === 429)
    return "Слишком много запросов. Подожди немного и повтори попытку.";
  if (error.httpStatus && error.httpStatus >= 500)
    return `Карточный стол временно недоступен (ошибка ${error.httpStatus}). Повтори попытку позже.`;
  if (error.httpStatus === 400)
    return "Не удалось принять данные. Проверь вопрос, тип расклада и выбранные карты.";
  return "Не удалось завершить действие. Проверь расклад и повтори попытку.";
}
