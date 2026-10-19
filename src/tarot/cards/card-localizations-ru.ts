import type {
  CardLocalization,
  CardMeanings,
  TarotCard,
} from "../shared/types.js";

/** Human-edited translation of the canonical RWS text, including its shared
 * prose. Never sends questions/card data to a translation service. */
const KEYWORDS: Record<string, string> = Object.fromEntries(
  `
new beginnings|новые начинания
trust|доверие
awakening|пробуждение
alignment|согласованность
choice|выбор
recklessness|безрассудство
naivety|наивность
blockage|блокировка
delay|задержка
shadow work|работа с тенью
manifestation|воплощение замысла
willpower|сила воли
manipulation|манипуляция
unused potential|нераскрытый потенциал
intuition|интуиция
inner knowing|внутреннее знание
secrets|тайны
blocked intuition|заблокированная интуиция
abundance|изобилие
nurturing|забота
creative block|творческий застой
dependence|зависимость
structure|структура
authority|авторитет
control|контроль
rigidity|негибкость
tradition|традиция
teaching|наставничество
nonconformity|неприятие условностей
questioning tradition|переосмысление традиции
union|союз
harmony|гармония
misalignment|несогласованность
disharmony|дисгармония
determination|решимость
victory|победа
lack of control|утрата контроля
scattered direction|отсутствие единого направления
courage|мужество
compassion|сострадание
self-doubt|сомнения в себе
inner weakness|внутренняя слабость
introspection|самоанализ
inner guidance|внутренний ориентир
isolation|изоляция
withdrawal|уход в себя
turning point|поворотный момент
cycles|циклы
resistance to change|сопротивление переменам
setbacks|неудачи
fairness|справедливость
accountability|ответственность за поступки
bias|предвзятость
dishonesty|нечестность
pause|пауза
new perspective|новый взгляд
stalling|затягивание
resistance|сопротивление
transformation|преображение
ending|завершение
resisting change|сопротивление переменам
stagnation|застой
balance|равновесие
moderation|умеренность
imbalance|дисбаланс
excess|излишество
attachment|привязанность
shadow|теневая сторона
release|освобождение
reclaiming power|возвращение собственной силы
upheaval|потрясение
revelation|откровение
avoiding change|избегание перемен
delayed disruption|отсроченный перелом
hope|надежда
renewal|обновление
discouragement|уныние
loss of faith|утрата веры
illusion|иллюзия
uncertainty|неопределённость
clarity|ясность
revealed truth|раскрывшаяся истина
joy|радость
success|успех
temporary cloudiness|временная неясность
delayed joy|отложенная радость
inner calling|внутренний зов
avoidance|уклонение
completion|завершённость
integration|обретение целостности
unfinished business|незавершённые дела
lack of closure|отсутствие завершённости
inspiration|вдохновение
creative spark|творческая искра
seed|зародыш нового
creative will|творческая воля
growth|рост
delays|задержки
blocked passion|сдерживаемая страсть
course correction|корректировка курса
planning|планирование
future vision|видение будущего
fear of change|страх перемен
small thinking|узость мышления
expansion|расширение возможностей
foresight|предвидение
development|развитие
limited growth|ограниченный рост
celebration|празднование
homecoming|возвращение домой
instability|нестабильность
private celebration|празднование в узком кругу
competition|соперничество
conflict|конфликт
challenge|испытание
conflict avoidance|избегание конфликта
resolution|разрешение ситуации
recognition|признание
exchange|обмен
lack of recognition|недостаток признания
defense|защита
perseverance|упорство
testing|проверка на прочность
overwhelm|перегруженность
giving up|отказ от борьбы
speed|скорость
movement|движение
momentum|нарастающий импульс
miscommunication|недопонимание
resilience|стойкость
boundaries|границы
culmination|кульминация
exhaustion|истощение
paranoia|болезненная подозрительность
burden|тяжёлая ноша
responsibility|ответственность
delegation|делегирование
enthusiasm|энтузиазм
exploration|исследование
learning|обучение
hesitation|нерешительность
unfocused energy|энергия без направления
action|действие
adventure|приключение
pursuit|стремление к цели
impulsiveness|импульсивность
scattered energy|распыление энергии
confidence|уверенность
vibrancy|жизненная яркость
inner mastery|внутреннее мастерство
insecurity|неуверенность
jealousy|ревность
leadership|лидерство
vision|широта видения
outer mastery|мастерство во внешнем мире
domineering|властность
new love|новая любовь
emotional opening|раскрытие чувств
emotion|чувства
blocked emotion|заблокированные чувства
self-love needed|потребность в любви к себе
partnership|партнёрство
mutual attraction|взаимное притяжение
disconnection|утрата связи
tension|напряжение
friendship|дружба
community|общность
overindulgence|чрезмерное потакание желаниям
exclusion|отверженность
apathy|апатия
contemplation|созерцание
new awareness|новое осознание
re-engagement|возвращение к участию
grief|горе
disappointment|разочарование
acceptance|принятие
moving on|движение дальше
nostalgia|ностальгия
kindness|доброта
living in the past|жизнь прошлым
maturity|зрелость
choices|варианты выбора
fantasy|фантазия
focused choice|осознанный выбор
walking away|уход
seeking meaning|поиск смысла
fear of leaving|страх уйти
aimless drifting|бесцельное блуждание
contentment|удовлетворённость
wish fulfillment|исполнение желания
inner dissatisfaction|внутренняя неудовлетворённость
smugness|самодовольство
family joy|семейная радость
unrealistic expectations|нереалистичные ожидания
creative message|творческое послание
emotional openness|эмоциональная открытость
emotional immaturity|эмоциональная незрелость
romance|романтика
idealism|идеализм
moodiness|переменчивость настроения
unrealistic romance|идеализация любви
emotional wisdom|эмоциональная мудрость
emotional overwhelm|переполненность чувствами
poor boundaries|слабые личные границы
emotional balance|эмоциональное равновесие
wise counsel|мудрый совет
emotional manipulation|манипуляция чувствами
repression|подавление
breakthrough|прорыв
thought|мысль
confusion|смятение
stalemate|тупик
difficult choice|трудный выбор
indecision|неспособность решиться
information overload|информационная перегрузка
heartbreak|душевная боль
truth|истина
healing|исцеление
forgiveness|прощение
rest|отдых
recovery|восстановление
burnout|выгорание
restlessness|беспокойство
hollow victory|пустая победа
reconciliation|примирение
resentment|обида
transition|переход
resistance to transition|сопротивление переходу
emotional baggage|эмоциональный груз прошлого
strategy|стратегия
deception|обман
confession|признание правды
self-deception|самообман
restriction|ограничение
limiting beliefs|ограничивающие убеждения
anxiety|тревога
nightmares|кошмары
painful ending|болезненное завершение
collapse|крах
survival|выживание
curiosity|любознательность
watchfulness|бдительность
gossip|сплетни
all talk|слова без дела
ambition|амбиции
direct action|решительное действие
haste|поспешность
clear boundaries|ясные границы
independence|независимость
coldness|холодность
bitterness|горечь
mental clarity|ясность ума
abuse of power|злоупотребление властью
manipulative logic|манипулятивная логика
opportunity|возможность
prosperity|процветание
work|труд
missed opportunity|упущенная возможность
poor planning|непродуманное планирование
adaptability|адаптивность
flexibility|гибкость
overcommitment|избыток обязательств
disorganization|неорганизованность
teamwork|командная работа
craftsmanship|ремесленное мастерство
poor collaboration|неэффективное сотрудничество
low standards|низкие требования к качеству
security|защищённость
scarcity mindset|мышление дефицита
letting go|умение отпустить
hardship|нужда
help received|полученная помощь
generosity|щедрость
fair exchange|справедливый обмен
strings attached|помощь с условиями
power dynamics|распределение власти
patience|терпение
assessment|оценка результатов
impatience|нетерпение
wasted effort|напрасные усилия
skill building|развитие навыков
dedication|преданность делу
perfectionism|перфекционизм
lack of focus|недостаток сосредоточенности
self-sufficiency|самодостаточность
luxury|роскошь
overdependence|чрезмерная зависимость
self-worth issues|трудности с самооценкой
legacy|наследие
family wealth|семейное благосостояние
family conflict|семейный конфликт
unstable legacy|неустойчивое наследие
study|учёба
practical opportunity|практическая возможность
procrastination|откладывание дел
lack of progress|отсутствие продвижения
reliability|надёжность
steady progress|постепенное продвижение
stubbornness|упрямство
nurturing abundance|создание изобилия через заботу
practical care|практическая забота
work-life imbalance|дисбаланс работы и личной жизни
self-neglect|пренебрежение собой
practical leadership|практичное руководство
greed|жадность
materialism|материализм
`
    .trim()
    .split("\n")
    .map((line) => line.split("|")),
);

const MAJOR_NAMES = [
  "Шут",
  "Маг",
  "Верховная Жрица",
  "Императрица",
  "Император",
  "Иерофант",
  "Влюблённые",
  "Колесница",
  "Сила",
  "Отшельник",
  "Колесо Фортуны",
  "Справедливость",
  "Повешенный",
  "Смерть",
  "Умеренность",
  "Дьявол",
  "Башня",
  "Звезда",
  "Луна",
  "Солнце",
  "Суд",
  "Мир",
];
const RANK_NAMES = [
  "",
  "Туз",
  "Двойка",
  "Тройка",
  "Четвёрка",
  "Пятёрка",
  "Шестёрка",
  "Семёрка",
  "Восьмёрка",
  "Девятка",
  "Десятка",
  "Паж",
  "Рыцарь",
  "Королева",
  "Король",
];
const SUIT_GEN: Record<string, string> = {
  wands: "Жезлов",
  cups: "Кубков",
  swords: "Мечей",
  pentacles: "Пентаклей",
};
const SUIT_SCOPE: Record<string, string> = {
  wands: "творческой воли, действий, амбиций и движения жизненной энергии",
  cups: "чувств, отношений, интуиции и сердечных переживаний",
  swords: "мыслей, истины, конфликтов, общения и решений",
  pentacles: "труда, ресурсов, тела, денег и практической реальности",
};
const MAJOR_SYMBOLS = [
  [
    "край обрыва",
    "маленькая собака",
    "белая роза",
    "узелок путника",
    "открытое небо",
  ],
  [
    "поднятый жезл",
    "знак бесконечности",
    "сад",
    "символы четырёх мастей на столе",
  ],
  ["две колонны", "лунный серп", "свиток Торы", "завеса", "неподвижная вода"],
  ["пшеничное поле", "текущая вода", "звёздная корона", "плодородный сад"],
  ["каменный трон", "бараны", "доспехи", "держава", "красные горы"],
  [
    "ключи",
    "тройная корона",
    "рука, поднятая для благословения",
    "два ученика",
  ],
  ["ангел", "две фигуры", "гора", "плодовое дерево", "ясное небо"],
  ["возничий", "сфинксы", "звёздный полог", "доспехи", "городские ворота"],
  [
    "спокойная фигура",
    "лев",
    "знак бесконечности",
    "белое одеяние",
    "цветочная гирлянда",
  ],
  ["фонарь", "посох", "горная вершина", "серый плащ", "уединённый путь"],
  [
    "вращающееся колесо",
    "фиксированные знаки зодиака",
    "сфинкс",
    "змей",
    "облака",
  ],
  ["весы", "меч", "колонны", "красное одеяние", "квадратная корона"],
  [
    "подвешенная фигура",
    "нимб",
    "скрещённые ноги",
    "живое дерево",
    "перевёрнутый взгляд",
  ],
  [
    "белая лошадь",
    "чёрное знамя",
    "восходящее солнце",
    "упавшая корона",
    "река",
  ],
  [
    "ангел",
    "вода, переливаемая между кубками",
    "одна нога в воде",
    "ирисы",
    "дальний путь",
  ],
  [
    "фигуры в цепях",
    "факел",
    "перевёрнутая пентаграмма",
    "чёрный постамент",
    "тёмная пещера",
  ],
  [
    "удар молнии",
    "падающая корона",
    "пламя",
    "падающие фигуры",
    "разрушенная башня",
  ],
  [
    "восемь звёзд",
    "кувшины с водой",
    "обнажённая фигура",
    "птица",
    "тихий водоём",
  ],
  ["залитая лунным светом тропа", "две башни", "собака", "волк", "рак"],
  ["сияющее солнце", "ребёнок", "белая лошадь", "красное знамя", "подсолнухи"],
  ["ангельская труба", "восстающие фигуры", "гробы", "горы", "зов пробуждения"],
  [
    "лавровый венок",
    "танцующая фигура",
    "четыре фиксированных знака зодиака",
    "скрещённые жезлы",
  ],
];
const SPECIAL_SYMBOLS: Record<string, string[]> = {
  two_of_wands: [
    "два вертикальных жезла — сохранённый потенциал и следующий рубеж",
    "глобус в руке — видение будущего и широкие горизонты",
    "крепостная стена — нынешняя защищённость",
    "далёкий пейзаж — планируемое расширение возможностей",
    "красная одежда — творческое желание и деятельная воля",
  ],
  three_of_pentacles: [
    "три пентакля в арке — мастерство, структура и общие требования к качеству",
    "каменная арка — долговечность труда",
    "ремесленник — мастерство на практике",
    "сотрудники с планом — командная работа и обратная связь",
    "храмовое пространство — обретение смысла через служение",
  ],
  five_of_pentacles: [
    "пять пентаклей в витраже — материальная и духовная помощь поблизости",
    "снег — нужда и незащищённость",
    "два путника — общие трудности",
    "костыли и изношенная одежда — уязвимость",
    "освещённое окно — поддержка, которую нужно заметить или попросить",
  ],
};
const SPECIAL_SCENES: Record<string, string> = {
  two_of_wands:
    "Человек стоит между двумя вертикальными жезлами на крепостной стене. Он держит глобус и смотрит вдаль, за сушу и море, представляя более масштабное будущее.",
  three_of_pentacles:
    "Ремесленник трудится под аркой с тремя пентаклями, пока его сотрудники рассматривают чертёж. Общие требования к качеству укрепляют мастерство.",
  five_of_pentacles:
    "Две измученные фигуры идут по снегу под витражом с пятью пентаклями. Сцена передаёт нужду, отверженность и возможность найти помощь поблизости.",
};
const ELEMENTS: Record<string, string> = {
  Air: "Воздух",
  Fire: "Огонь",
  Water: "Вода",
  Earth: "Земля",
};
const PLANETS: Record<string, string> = {
  Mercury: "Меркурий",
  Moon: "Луна",
  Venus: "Венера",
  Jupiter: "Юпитер",
  Mars: "Марс",
  Sun: "Солнце",
  Saturn: "Сатурн",
};
const SIGNS: Record<string, string> = {
  Aries: "Овне",
  Taurus: "Тельце",
  Gemini: "Близнецах",
  Cancer: "Раке",
  Leo: "Льве",
  Virgo: "Деве",
  Libra: "Весах",
  Scorpio: "Скорпионе",
  Sagittarius: "Стрельце",
  Capricorn: "Козероге",
  Aquarius: "Водолее",
  Pisces: "Рыбах",
};
const SIGN_NAMES: Record<string, string> = {
  Aries: "Овен",
  Taurus: "Телец",
  Gemini: "Близнецы",
  Cancer: "Рак",
  Leo: "Лев",
  Virgo: "Дева",
  Libra: "Весы",
  Scorpio: "Скорпион",
  Sagittarius: "Стрелец",
  Capricorn: "Козерог",
  Aquarius: "Водолей",
  Pisces: "Рыбы",
};
const ELEMENT_GEN: Record<string, string> = {
  Air: "Воздуха",
  Fire: "Огня",
  Water: "Воды",
  Earth: "Земли",
};

function word(en: string): string {
  const ru = KEYWORDS[en];
  if (!ru) throw new Error(`Missing Russian card keyword: ${en}`);
  return ru;
}
function astrology(en: string): string {
  if (ELEMENTS[en] || PLANETS[en] || SIGN_NAMES[en])
    return ELEMENTS[en] || PLANETS[en] || SIGN_NAMES[en];
  const root = en.match(/^Root of the Powers of (\w+)$/);
  if (root) return `Корень сил ${ELEMENT_GEN[root[1]]}`;
  const position = en.split(" in ");
  if (position.length === 2 && PLANETS[position[0]] && SIGNS[position[1]])
    return `${PLANETS[position[0]]} в ${SIGNS[position[1]]}`;
  const element = en.split(" of ");
  if (element.length === 2 && ELEMENTS[element[0]] && ELEMENT_GEN[element[1]])
    return `${ELEMENTS[element[0]]} ${ELEMENT_GEN[element[1]]}`;
  throw new Error(`Missing Russian astrology: ${en}`);
}

export function russianCardLocalization(card: TarotCard): CardLocalization {
  const n = card.number!;
  const name =
    card.arcana === "major"
      ? MAJOR_NAMES[n]
      : `${RANK_NAMES[n]} ${SUIT_GEN[card.suit!]}`;
  const keywords = {
    upright: card.keywords.upright.map(word),
    reversed: card.keywords.reversed.map(word),
  };
  const rank = card.arcana === "minor" ? word(card.keywords.upright[2]) : "";
  const scope = card.arcana === "minor" ? SUIT_SCOPE[card.suit!] : "";
  const meanings = {} as { upright: CardMeanings; reversed: CardMeanings };
  for (const orientation of ["upright", "reversed"] as const) {
    const direct = orientation === "upright";
    const title = `Карта «${name}» ${direct ? "в прямом" : "в перевёрнутом"} положении`;
    const themes = keywords[orientation].slice(0, 2).join(", ");
    const lesson =
      card.arcana === "major"
        ? direct
          ? "созидательное проявление урока роста, заложенного в архетипе"
          : "искажённое или отсроченное проявление теневого урока архетипа"
        : `${direct ? "созидательное" : "искажённое или отсроченное"} проявление принципа «${rank}» в сфере ${scope}`;
    // All ten source meanings follow this exact structure. Keep every caveat
    // and context, rather than reducing the original to a keyword summary.
    meanings[orientation] = {
      general: `${title} раскрывает темы: ${themes}, а также ${lesson}. Рассматривай это как основную закономерность ситуации; уточняй её через позицию карты, вопрос и соседние карты.`,
      love: `В любви и отношениях ${title.replace(/^К/, "к")} указывает на темы: ${themes}, а также ${lesson}. Они влияют на доверие, притяжение, взаимность, границы и своевременность эмоционального сближения. Карта описывает динамику отношений, а не гарантирует определённый исход.`,
      career: `В вопросах работы, учёбы и денег ${title.replace(/^К/, "к")} показывает темы: ${themes}, а также ${lesson}. Они связаны с усилиями, планированием, сотрудничеством, ресурсами, риском и ответственностью. Используй этот ориентир, чтобы выбрать следующий практический шаг.`,
      health: `В вопросах самочувствия ${title.replace(/^К/, "к")} символически отражает темы: ${themes}, а также ${lesson}. Речь об энергии, привычках, стрессе, отдыхе и источниках поддержки. Это не диагноз и не замена квалифицированной профессиональной помощи.`,
      spirituality: `В духовном плане ${title.replace(/^К/, "к")} предлагает осознанно, со смирением и дисциплиной внутренней практики встретить темы: ${themes}, а также ${lesson}. Задача — усвоить послание карты и встроить его в жизнь, а не добиваться немедленного ответа.`,
    };
  }
  let symbolism: string[];
  let description: string;
  if (card.arcana === "major") {
    const symbols = MAJOR_SYMBOLS[n];
    symbolism = symbols.map((symbol) => `${symbol} — образ карты «${name}»`);
    description = `На карте «${name}» в колоде Райдера — Уэйта — Смит изображены: ${symbols.join(", ")}. В современной трактовке этой колоды образ раскрывает темы «${keywords.upright[0]}», «${keywords.upright[1]}» и урок архетипа карты.`;
  } else {
    const counts = [
      "",
      "один",
      "два",
      "три",
      "четыре",
      "пять",
      "шесть",
      "семь",
      "восемь",
      "девять",
      "десять",
    ];
    const nouns: Record<string, string[]> = {
      wands: ["жезл", "жезла", "жезлов"],
      cups: ["кубок", "кубка", "кубков"],
      swords: ["меч", "меча", "мечей"],
      pentacles: ["пентакль", "пентакля", "пентаклей"],
    };
    const object =
      n > 10
        ? "символ масти на придворной карте"
        : `${counts[n]} ${nouns[card.suit!][n === 1 ? 0 : n < 5 ? 1 : 2]}`;
    const firstSymbol =
      n > 10
        ? `символ масти на придворной карте — ${rank}`
        : `${object} — ${rank} в масти`;
    symbolism = SPECIAL_SYMBOLS[card.id] ?? [
      firstSymbol,
      `масть ${SUIT_GEN[card.suit!]} — сфера ${scope}`,
      `стихия ${ELEMENTS[card.element![0].toUpperCase() + card.element!.slice(1)].toLowerCase()} — характер энергии`,
      "композиция Райдера — Уэйта — Смит — подсказки к жизненному сюжету",
      "поза фигуры на переднем плане — способ обращения с энергией",
    ];
    const scene =
      SPECIAL_SCENES[card.id] ??
      `В масти ${SUIT_GEN[card.suit!]} колоды Райдера — Уэйта — Смит ${object} выражает принцип «${rank}» через сферу ${scope}.`;
    description = `${scene} Эта сцена связывает карту «${name}» с современными значениями «${keywords.upright[0]}», «${keywords.upright[1]}» и жизненными обстоятельствами, показанными мастью ${SUIT_GEN[card.suit!]}.`;
  }
  return {
    name,
    keywords,
    meanings,
    symbolism,
    description,
    astrology: astrology(card.astrology!),
    numerology:
      card.arcana === "major"
        ? n === 0
          ? "0 — открытое начало"
          : `${n} — этап ${n} путешествия Шута`
        : `${n} — принцип «${rank}», выраженный через масть ${SUIT_GEN[card.suit!]}`,
  };
}
