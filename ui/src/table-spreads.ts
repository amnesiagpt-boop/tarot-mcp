import type { Language } from "./types.js";
export function getTableSpreads(language: Language) {
  const ru = language === "ru";
  return [
    {
      id: "single_card",
      name: ru ? "Одна карта" : "One card",
      cardCount: 1,
      description: ru
        ? "Одна тема для рассмотрения без вывода о гарантированном событии."
        : "One focus for reflection.",
      positions: [
        {
          name: ru ? "Основная тема" : "Focus",
          meaning: ru
            ? "Какую тему предлагает рассмотреть карта."
            : "The theme of this card.",
        },
      ],
    },
    {
      id: "three_card",
      name: ru ? "Линия из трёх карт" : "Three-card line",
      cardCount: 3,
      description: ru
        ? "Три последовательные позиции. Для Ленорман дополнительно рассматриваются только проверенные соседние сочетания."
        : "Three positions with system-specific reference meanings.",
      positions: [
        {
          name: ru ? "Контекст" : "Context",
          meaning: ru
            ? "Исходная ситуация и её условия."
            : "The starting context.",
        },
        {
          name: ru ? "Основная тема" : "Main focus",
          meaning: ru ? "Центральный аспект запроса." : "The central theme.",
        },
        {
          name: ru ? "Направление" : "Direction",
          meaning: ru
            ? "Возможное направление, которое требует проверки в реальности."
            : "A possible direction, not a prediction.",
        },
      ],
    },
    {
      id: "line_five",
      name: ru ? "Линия из пяти карт" : "Five-card line",
      cardCount: 5,
      description: ru
        ? "Более подробный обзор вопроса в пяти позициях."
        : "Five positions for a broader view.",
      positions: (ru
        ? [
            "Контекст",
            "Что влияет",
            "Центральная тема",
            "Что требует внимания",
            "Направление",
          ]
        : ["Context", "Influence", "Central theme", "Attention", "Direction"]
      ).map((name) => ({ name, meaning: name })),
    },
  ];
}
