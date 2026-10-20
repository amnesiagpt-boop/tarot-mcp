import type { TarotCard } from "../tarot/shared/types.js";
import { cardImage, getDeck, type DeckId } from "../tarot/shared/decks.js";

export interface SystemCard {
  id: string;
  name: string;
  meaning: string;
  keywords: string[];
  number?: number;
  suit?: string;
  rank?: string;
  orientation: "upright" | "reversed";
  imageUri: string;
}
export interface PositionedCard extends SystemCard {
  displayName: string;
  position: string;
  positionMeaning: string;
}
const LENORMAND = [
  ["Всадник", "Известие, движение, появление новой информации."],
  ["Клевер", "Небольшая возможность, краткий удачный момент."],
  ["Корабль", "Дистанция, поездка, расширение привычных границ."],
  ["Дом", "Дом, личное пространство, семейная основа."],
  ["Дерево", "Постепенный рост, корни и длительные процессы."],
  ["Тучи", "Неясность, сомнение, недостаток информации."],
  ["Змея", "Сложный путь, обходные решения, осторожность."],
  [
    "Гроб",
    "Завершение этапа и необходимость отпустить прежнее; не буквальная смерть.",
  ],
  ["Букет", "Приглашение, признательность, приятный жест."],
  [
    "Коса",
    "Резкое изменение или решение; не доказательство физической опасности.",
  ],
  ["Метла", "Повторяющееся напряжение, спор, тема договорённостей."],
  ["Птицы", "Разговоры, обмен мнениями, беспокойство."],
  ["Ребёнок", "Начало, небольшой масштаб, недостаток опыта."],
  ["Лиса", "Осмотрительность, личный интерес, проверка условий."],
  ["Медведь", "Влияние, поддержка, контроль над ресурсами."],
  ["Звёзды", "Ориентир, надежда, представление о направлении."],
  ["Аисты", "Переход, обновление, изменение привычного."],
  ["Собака", "Доверие, дружба, надёжное сопровождение."],
  ["Башня", "Организация, границы, самостоятельность, дистанция."],
  ["Сад", "Общество, публичная среда, сообщество."],
  ["Гора", "Преграда, задержка, задача, требующая усилий."],
  ["Развилка", "Выбор, несколько путей, необходимость определить приоритет."],
  ["Мыши", "Постепенные потери, износ, мелкие беспокойства."],
  ["Сердце", "Чувства, симпатия, эмоциональная вовлечённость."],
  ["Кольцо", "Договорённость, обязательство, повторяющаяся связь."],
  ["Книга", "Знание, обучение, пока неизвестная информация."],
  ["Письмо", "Сообщение, документ, письменная коммуникация."],
  [
    "Мужчина",
    "Фигура человека в ситуации; её роль задаёт пользователь, а не предполагаемый пол или характер.",
  ],
  [
    "Женщина",
    "Фигура человека в ситуации; её роль задаёт пользователь, а не предполагаемый пол или характер.",
  ],
  ["Лилии", "Зрелость, спокойствие, опыт и качество."],
  ["Солнце", "Ясность, энергия, заметность; значение зависит от контекста."],
  ["Луна", "Эмоциональный отклик, восприятие, признание."],
  ["Ключ", "Решение, доступ, значимый способ разобраться."],
  ["Рыбы", "Ресурсы, обмен, движение средств."],
  ["Якорь", "Устойчивость, закрепление, долгосрочная опора."],
  ["Крест", "Ответственность, нагрузка, сложная значимая тема."],
] as const;
export function lenormandCards(): SystemCard[] {
  return LENORMAND.map(([name, meaning], i) => ({
    id: `lenormand_${i + 1}`,
    name,
    meaning,
    keywords: meaning.split(",").slice(0, 3),
    number: i + 1,
    orientation: "upright",
    imageUri: cardImage("lenormand-classic", `lenormand_${i + 1}`),
  }));
}
const SUITS: Record<string, { name: string; theme: string }> = {
  hearts: {
    name: "червей",
    theme: "отношения, эмоциональный контакт и поддержка",
  },
  diamonds: {
    name: "бубен",
    theme: "практические вопросы, обмен и материальные ресурсы",
  },
  clubs: { name: "треф", theme: "дела, усилия, обязанности и сотрудничество" },
  spades: {
    name: "пик",
    theme: "границы, напряжение, необходимость трезво оценить ограничения",
  },
};
const RANKS: Record<string, { name: string; theme: string }> = {
  "2": { name: "Двойка", theme: "обмен между двумя сторонами" },
  "3": { name: "Тройка", theme: "развитие взаимодействия" },
  "4": { name: "Четвёрка", theme: "опора и установленный порядок" },
  "5": { name: "Пятёрка", theme: "изменение привычного равновесия" },
  "6": { name: "Шестёрка", theme: "перемещение и переход" },
  "7": { name: "Семёрка", theme: "обсуждение и оценка намерений" },
  "8": { name: "Восьмёрка", theme: "практическое взаимодействие и разговор" },
  "9": { name: "Девятка", theme: "личная заинтересованность и переживание" },
  "10": { name: "Десятка", theme: "масштаб дела и накопленный результат" },
  jack: { name: "Валет", theme: "весть, поручение или роль исполнителя" },
  queen: { name: "Дама", theme: "участие, влияние или роль поддержки" },
  king: {
    name: "Король",
    theme: "решение, ответственность или роль организатора",
  },
  ace: { name: "Туз", theme: "основная тема масти и её отправная точка" },
};
/** A separate suit/rank reference, deliberately not Tarot numerology or guaranteed prediction. */
export function playingCards(size: 36 | 52): SystemCard[] {
  const ranks =
    size === 36
      ? ["6", "7", "8", "9", "10", "jack", "queen", "king", "ace"]
      : Object.keys(RANKS);
  return Object.entries(SUITS).flatMap(([suit, s]) =>
    ranks.map((rank) => ({
      id: `${suit}_${rank}`,
      name: `${RANKS[rank].name} ${s.name}`,
      meaning: `Масть: ${s.theme}. Достоинство: ${RANKS[rank].theme}. Это справочные темы выбранной редакции, не установленное описание человека или будущего.`,
      keywords: [s.theme, RANKS[rank].theme],
      suit,
      rank,
      orientation: "upright" as const,
      imageUri: cardImage(
        size === 36 ? "playing-36" : "playing-52",
        `${suit}_${rank}`,
      ),
    })),
  );
}
export function tarotCards(
  cards: readonly TarotCard[],
  language: string,
  reversed: boolean,
): SystemCard[] {
  return cards.map((card) => {
    const localized =
      language === "ru" ? card.ru : language === "zh" ? card.zh : undefined;
    const orientation = reversed ? "reversed" : "upright";
    return {
      id: card.id,
      name: localized?.name ?? card.name,
      meaning:
        localized?.meanings?.[orientation]?.general ??
        card.meanings[orientation].general,
      keywords:
        localized?.keywords?.[orientation] ?? card.keywords[orientation],
      number: card.number,
      suit: card.suit,
      orientation,
      imageUri: cardImage("tarot-classic", card.id),
    };
  });
}

const heartSource =
  "https://labyrinthos.co/blogs/lenormand-cards/the-heart-lenormand-card-meaning-and-combinations";
const ringSource =
  "https://labyrinthos.co/blogs/lenormand-cards/the-ring-lenormand-card-meaning-and-combinations";
/** Directional, explicitly sourced whitelist. Unknown pairs must never be invented. */
export const LENORMAND_PAIRS: Readonly<
  Record<string, { text: string; source: string }>
> = {
  "24:25": {
    text: "Чувства и обязательство: тема эмоционально значимой связи.",
    source: heartSource,
  },
  "24:27": {
    text: "Чувства и письмо: тема тёплого личного сообщения.",
    source: heartSource,
  },
  "24:18": {
    text: "Чувства и доверие: тема дружеской поддержки.",
    source: heartSource,
  },
  "24:21": {
    text: "Чувства и преграда: трудность в выражении близости.",
    source: heartSource,
  },
  "24:35": {
    text: "Чувства и опора: поиск устойчивости в отношениях.",
    source: heartSource,
  },
  "25:24": {
    text: "Обязательство, связанное с эмоциональной привязанностью.",
    source: ringSource,
  },
  "25:27": {
    text: "Договорённость в письменной форме или её обсуждение.",
    source: ringSource,
  },
  "25:21": {
    text: "Препятствие выполнению договорённости.",
    source: ringSource,
  },
  "25:22": { text: "Выбор относительно обязательства.", source: ringSource },
  "25:26": {
    text: "Обучение или дополнительные сведения о договорённости.",
    source: ringSource,
  },
};
export function lenormandCombinations(cards: readonly PositionedCard[]): {
  known: string[];
  missing: number;
} {
  const known: string[] = [];
  let missing = 0;
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i],
      b = cards[i + 1],
      rule = LENORMAND_PAIRS[`${a.number}:${b.number}`];
    if (rule) known.push(`${a.name} + ${b.name}: ${rule.text}`);
    else missing++;
  }
  return { known, missing };
}
const ROLE_PROMPTS: Record<string, string> = {
  past: "Какая из тем карты уже проявилась в исходной ситуации?",
  present: "Как эта тема проявляется в текущих действиях?",
  future:
    "При каких условиях это направление может развиваться, а что способно его изменить?",
  challenge: "Какое ограничение требует внимания?",
  advice: "Какое конкретное действие по этой теме можно проверить?",
  resource: "На какую доступную опору можно рассчитывать?",
  result: "Какой наблюдаемый результат будет признаком изменения?",
};
export function positionQuestion(position: string, meaning: string): string {
  const text = (position + " " + meaning).toLowerCase();
  let key = text.match(/прошл|past|исток/)
    ? "past"
    : text.match(/будущ|future|направлен/)
      ? "future"
      : text.match(/препят|сложност|challenge|блок/)
        ? "challenge"
        : text.match(/совет|действие|advice|шаг/)
          ? "advice"
          : text.match(/ресурс|опор|resource/)
            ? "resource"
            : text.match(/результат|итог|result/)
              ? "result"
              : "present";
  return ROLE_PROMPTS[key];
}
export function interpretSystem(
  deckId: DeckId,
  cards: readonly PositionedCard[],
  language: string,
): string {
  const deck = getDeck(deckId);
  if (language !== "ru") {
    return cards
      .map(
        (c, i) =>
          `### ${i + 1}. ${c.position} — ${c.name}\n\n${c.meaning}\n\nPosition: ${c.positionMeaning || c.position}`,
      )
      .join("\n\n");
  }
  const blocks = cards.map(
    (c, i) =>
      `### ${i + 1}. ${c.position} — ${c.name}\n\n${c.meaning}\n\n**Роль позиции:** ${c.positionMeaning || c.position}\n\n**Вопрос для проверки:** ${positionQuestion(c.position, c.positionMeaning)}`,
  );
  if (deck.system === "lenormand") {
    const pairs = lenormandCombinations(cards);
    if (pairs.known.length)
      blocks.push(
        "### Проверенные соседние сочетания\n\n" +
          pairs.known.map((x) => "- " + x).join("\n"),
      );
    if (pairs.missing)
      blocks.push(
        `Для ${pairs.missing} из соседних сочетаний в текущем проверенном справочнике нет правила. Их общее значение не утверждается; выше приведены отдельные темы карт.`,
      );
  }
  if (deck.system === "playing")
    blocks.push(
      "Масти и достоинства рассмотрены отдельно в каждой позиции. Подсчёт мастей сам по себе не определяет итог; фигуры не устанавливают личность или мысли конкретного человека.",
    );
  return blocks.join("\n\n");
}
