export type Boat = {
  slug: string;
  name: string;
  shortName?: string;
  priceFrom?: string;
  capacity?: string;
  year?: string;
  engine?: string;
  power?: string;
  maxSpeed?: string;
  fuelTank?: string;
  comfort?: string[];
  bestFor?: string[];
  description?: string;
  accessNote?: string;
  depositNote?: string;
  instructionNote?: string;
  images: string[];
  thumbnails: string[];
};

function gallery(slug: string, count: number) {
  const images: string[] = [];
  const thumbnails: string[] = [];
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");
    images.push(`/images/boats-webp/${slug}/${num}.webp`);
    thumbnails.push(`/images/boats-webp-thumbs/${slug}/${num}.webp`);
  }
  return { images, thumbnails };
}

const goluboy = gallery("goluboy-kater", 3);
const krasnyy = gallery("krasnyy-kater", 3);
const belyy = gallery("belyy-kater", 2);
const zheltyy = gallery("zheltyy-kater", 1);

export const boats: Boat[] = [
  {
    slug: "goluboy-kater",
    name: "Голубой катер",
    shortName: "Голубой",
    priceFrom: "уточняется при бронировании",
    capacity: "уточняется при бронировании",
    description:
      "Прогулочный катер для самостоятельных выходов по воде Петербурга. Точные характеристики и условия допуска подтверждает менеджер.",
    accessNote: "уточняются при бронировании",
    depositNote: "уточняется при бронировании",
    instructionNote: "инструктаж перед выходом на воду",
    bestFor: ["прогулка с друзьями", "фотосессия", "семейная прогулка"],
    images: goluboy.images,
    thumbnails: goluboy.thumbnails,
  },
  {
    slug: "krasnyy-kater",
    name: "Красный катер",
    shortName: "Красный",
    priceFrom: "уточняется при бронировании",
    capacity: "уточняется при бронировании",
    description:
      "Катер для неспешной прогулки по Неве и каналам. Формат и маршрут согласуются перед бронированием.",
    accessNote: "уточняются при бронировании",
    depositNote: "уточняется при бронировании",
    instructionNote: "инструктаж перед выходом на воду",
    bestFor: ["свидание", "закатная прогулка", "день рождения"],
    images: krasnyy.images,
    thumbnails: krasnyy.thumbnails,
  },
  {
    slug: "belyy-kater",
    name: "Белый катер",
    shortName: "Белый",
    priceFrom: "уточняется при бронировании",
    capacity: "уточняется при бронировании",
    description:
      "Светлый катер для камерных прогулок небольшой компанией. Детали аренды уточняет менеджер.",
    accessNote: "уточняются при бронировании",
    depositNote: "уточняется при бронировании",
    instructionNote: "инструктаж перед выходом на воду",
    bestFor: ["семейная прогулка", "прогулка с друзьями", "фотосессия"],
    images: belyy.images,
    thumbnails: belyy.thumbnails,
  },
  {
    slug: "zheltyy-kater",
    name: "Жёлтый катер",
    shortName: "Жёлтый",
    priceFrom: "уточняется при бронировании",
    capacity: "уточняется при бронировании",
    description:
      "Яркий катер для прогулок по воде Санкт-Петербурга. Условия аренды и допуска согласуются индивидуально.",
    accessNote: "уточняются при бронировании",
    depositNote: "уточняется при бронировании",
    instructionNote: "инструктаж перед выходом на воду",
    bestFor: ["просто прогулка", "свидание", "закат на воде"],
    images: zheltyy.images,
    thumbnails: zheltyy.thumbnails,
  },
];

/** Фото без привязки к катеру (general) — для отчёта */
export const unmatchedImages = ["/images/boats-webp/general/01.webp"];
