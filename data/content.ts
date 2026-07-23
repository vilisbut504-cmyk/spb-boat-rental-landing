import {
  baseTariffRows,
  formatRub,
  fifthPassengerNote,
  captainServiceNote as captainNoteFromPricing,
  specialTariffNote,
} from "@/data/pricing";

export const prepaymentAmount = "1 000 ₽";

export const prepaymentNote = "Предоплата 1 000 ₽ в счёт прогулки";

export const prepaymentBookingLine = "Бронь: 1 000 ₽ в счёт катания";

export const prepaymentHeroBadge = "Бронь от 1 000 ₽ в счёт катания";

export const fleetEngineNote =
  "Все катера оснащены японскими четырёхтактными инжекторными моторами Suzuki и Tohatsu.";

export type TariffPanel = {
  id: "weekday" | "weekend";
  days: string;
  rows: { label: string; note?: string; price: string }[];
  perks: string[];
};

/** Base tariffs — special +500 ₽ for Sexy Sea Red / Yellow Space is derived in data/pricing.ts */
export const tariffPanels: TariffPanel[] = [
  {
    id: "weekday",
    days: "Понедельник — четверг",
    rows: baseTariffRows.weekday.map((row) => ({
      label: row.label,
      note: row.note,
      price: formatRub(row.price),
    })),
    perks: [
      "До 13:00 действует скидка 10%",
      fifthPassengerNote,
    ],
  },
  {
    id: "weekend",
    days: "Пятница — воскресенье",
    rows: baseTariffRows.weekend.map((row) => ({
      label: row.label,
      note: row.note,
      price: formatRub(row.price),
    })),
    perks: [fifthPassengerNote],
  },
];

export const tariffIncluded = [
  "Бесплатный инструктаж 15 минут входит в каждый тариф",
  "Спасательные жилеты предоставляются",
  "Услуги капитана — 1 000 ₽/час",
  "Доплата за пятое место 1 000 ₽ действует только для Sexy Sea Red и Yellow Space — на остальных катерах до 4 человек",
  "Никаких скрытых платежей",
];

export const captainServiceNote = captainNoteFromPricing;

export { specialTariffNote };

export const tariffConditions = [
  "Бронь: 1 000 ₽ в счёт прогулки",
  "Возраст арендатора: от 18 лет",
  "Договор: для оформления необходимо предъявить паспорт",
  "Документ в залог: любой другой согласованный документ — паспорт не остаётся в залоге",
  "Инструктаж: бесплатно перед выходом на воду",
  "Права ГИМС: не требуются",
  "Денежный залог: 10 000 ₽ наличными перед выходом, возврат по условиям договора",
  "Алкоголь: запрещён до и во время управления катером",
  "Маршрут: согласуется с менеджером перед выходом",
  "Погода: при небезопасных условиях прогулка переносится",
];

export const tariffDisclaimer =
  "Предоплата 1 000 ₽ входит в стоимость прогулки. Катер, дату, время, маршрут и способ внесения предоплаты подтверждает менеджер.";

export const advantages = [
  {
    icon: "wheel",
    title: "Вы управляете сами — без прав ГИМС и легально",
    text: "Вы сами за штурвалом и управляете катером после подробного инструктажа. Всё необходимое объясняем перед выходом на воду.",
  },
  {
    icon: "shield",
    title: "Бесплатный подробный инструктаж",
    text: "Перед стартом объясняем управление, маршрут, правила движения по воде и основные ограничения.",
  },
  {
    icon: "map",
    title: "Красочные маршруты по Петербургу",
    text: "Нева, острова, городские каналы, Финский залив и Лахта Центр — поможем выбрать маршрут под настроение и время прогулки.",
  },
  {
    icon: "boat",
    title: "Большой парк катеров",
    text: "В парке семь катеров разных цветов. Они подходят для свиданий, прогулок с друзьями, дней рождения, фотосессий и красивых выходов на воду на закате.",
  },
  {
    icon: "motor",
    title: "Японские моторы Suzuki и Tohatsu",
    text: "Катера оснащены современными четырёхтактными инжекторными моторами Suzuki и Tohatsu — с понятным управлением и уверенным ходом на воде.",
  },
  {
    icon: "speaker",
    title: "Музыка на воде",
    text: "Берите любимый плейлист — портативную колонку предоставим перед выходом на воду.",
  },
];

export const scenarios = [
  { icon: "heart", title: "Яркое свидание" },
  { icon: "users", title: "Прогулка с друзьями" },
  { icon: "cake", title: "День рождения" },
  { icon: "moon-water", title: "Романтический вечер на воде" },
  { icon: "family", title: "Семейная прогулка" },
  { icon: "camera", title: "Фотосессия" },
];

export type Step = {
  n: string;
  title: string;
  /** Renders a red exclamation mark right after the title */
  titleExclamation?: boolean;
  text: string;
};

export const steps: Step[] = [
  {
    n: "01",
    title: "Вы выбираете катер и оставляете заявку",
    text: "Через форму на сайте или по телефону — как удобнее.",
  },
  {
    n: "02",
    title: "Менеджер подтверждает дату, время и маршрут",
    text: "Уточняет детали и помогает подобрать формат прогулки.",
  },
  {
    n: "03",
    title: "Вносите предоплату 1 000 ₽ в счёт прогулки",
    text: "Сумма фиксирует бронь и входит в стоимость.",
  },
  {
    n: "04",
    title: "Приезжаете к точке старта",
    text: "Для оформления договора необходимо предъявить паспорт. Перед выходом на воду в залог передаётся любой другой согласованный документ. Паспорт не остаётся в залоге.",
  },
  {
    n: "05",
    title: "Вносите залог 10 000 ₽ наличными",
    titleExclamation: true,
    text: "Денежный залог передаётся перед выходом на воду. Возврат залога осуществляется по условиям договора.",
  },
  {
    n: "06",
    title: "Проходите бесплатный инструктаж и выходите на воду",
    text: "Объясняем управление, маршрут и правила движения.",
  },
];

export const stepNotes = [
  "Предоплата 1 000 ₽ фиксирует бронь, входит в стоимость прогулки и не является дополнительным сбором.",
  "Для заключения договора необходимо предъявить паспорт. Перед выходом на воду в залог передаётся любой другой согласованный документ. Паспорт не остаётся в залоге.",
  "Перед выходом вносится денежный залог 10 000 ₽ наличными. Возврат залога осуществляется по условиям договора.",
  "Алкоголь запрещён до и во время управления катером.",
];

export const alcoholRule = "Алкоголь запрещён до и во время управления катером.";

export const safetyCards = [
  {
    title: "Без прав ГИМС и легально",
    text: "Самостоятельное управление катерами нашего парка проходит легально после подробного инструктажа.",
  },
  {
    title: "Бесплатный подробный инструктаж",
    text: "Объясняем управление, маршрут и правила движения по воде перед каждой прогулкой.",
  },
  {
    title: "Спасательные жилеты на борту",
    text: "Средства безопасности предусмотрены для всех пассажиров на время прогулки.",
  },
  {
    title: "Маршрутная карта",
    text: "На борту есть карта согласованного маршрута с понятными ориентирами и границами зоны движения.",
  },
  {
    title: "Погодные ограничения",
    text: "Контролируем погодные условия: при небезопасной погоде прогулку переносим на другое время.",
  },
  {
    title: "Связь с менеджером",
    text: "Вы остаётесь на связи с менеджером на протяжении всей прогулки.",
  },
  {
    title: "Алкоголь запрещён",
    text: "Алкоголь запрещён до и во время управления катером.",
    highlight: true,
  },
  {
    title: "Договор и залог 10 000 ₽",
    text: "Паспорт предъявляется для оформления договора и не остаётся в залоге — в залог передаётся другой согласованный документ. Отдельно вносится денежный залог 10 000 ₽ наличными, возврат — по условиям договора.",
  },
];

export const heroBadges = [
  "Без прав ГИМС",
  "Легально после инструктажа",
  "Санкт-Петербург",
  "До 5 человек",
  "Бронь 1 000 ₽ в счёт катания",
];

/** Hero OG / social collage — not used in the visual Hero mosaic */
export const heroImage = "/images/hero/hero-fleet-lakhta.webp";

/**
 * Four real hero photos — fixed order 1→4.
 * Visual mosaic: TL 01, TR 02, BL 03, BR 04 (girl → boat / boat → girl).
 * All WebPs are 4:5; landscape sources have blurred fill baked in at process time.
 */
export const heroRealPhotos = [
  {
    src: "/images/hero/hero-real-01.webp",
    alt: "Девушка отдыхает в чёрном катере на воде в Санкт-Петербурге",
    objectPosition: "center 18%",
  },
  {
    src: "/images/hero/hero-sexy-sea-red-2026.webp",
    alt: "Красный катер Sexy Sea Red на ходу по воде в Санкт-Петербурге",
    objectPosition: "center center",
  },
  {
    src: "/images/hero/hero-total-black-2026.webp",
    alt: "Чёрный катер Total Black на воде в Санкт-Петербурге",
    objectPosition: "center 42%",
  },
  {
    src: "/images/hero/hero-real-04.webp",
    alt: "Девушка отдыхает в красном катере на воде в Санкт-Петербурге",
    objectPosition: "center 22%",
  },
] as const;

export const brandAssets = {
  /** Graphic mark only — no brand wordmark (old raster logos retained but unused in UI) */
  logoSmall: "/images/brand/logo-mark.webp",
  logoFull: "/images/brand/logo-mark-lg.webp",
  favicon: "/images/brand/favicon.png",
  logoAlt: "Катер без капитана — аренда катера без прав в Санкт-Петербурге",
} as const;
