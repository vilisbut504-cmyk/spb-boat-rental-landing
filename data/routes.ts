export type RouteItem = {
  title: string;
  description: string;
  mood: string;
  duration: string;
  image: string;
};

export const routes: RouteItem[] = [
  {
    title: "Нева и виды города",
    description:
      "Главная водная артерия Петербурга: парадные набережные, мосты и панорамы исторического центра с воды.",
    mood: "Парадно и масштабно",
    duration: "уточняется при бронировании",
    image: "/images/route-neva.svg",
  },
  {
    title: "Разводные мосты",
    description:
      "Ночной выход к разводке мостов — один из самых узнаваемых сюжетов города на Неве.",
    mood: "Атмосферно и эффектно",
    duration: "уточняется при бронировании",
    image: "/images/route-bridges.svg",
  },
  {
    title: "Каналы Петербурга",
    description:
      "Узкие каналы, низкие мосты и камерные виды старого города в неспешном темпе.",
    mood: "Камерно и уютно",
    duration: "уточняется при бронировании",
    image: "/images/route-canals.svg",
  },
  {
    title: "Финский залив",
    description:
      "Простор открытой воды, морской бриз и современная панорама с видом на горизонт.",
    mood: "Свободно и просторно",
    duration: "уточняется при бронировании",
    image: "/images/route-bay.svg",
  },
  {
    title: "Закат на воде",
    description:
      "Вечерний маршрут под мягкий свет заходящего солнца — спокойное завершение дня на воде.",
    mood: "Романтично и спокойно",
    duration: "уточняется при бронировании",
    image: "/images/route-sunset.svg",
  },
];
