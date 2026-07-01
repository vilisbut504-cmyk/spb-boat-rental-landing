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
  depositNote?: string;
  instructionNote?: string;
  engineNote?: string;
  badge?: string;
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

const sharedComfort = [
  "место для хранения вещей",
  "кожаный салон",
  "спасательные жилеты",
  "пледы",
  "карта маршрута",
];

const sharedEngineNote = "Оснащён японским мотором Suzuki / Tohatsu";

export const boats: Boat[] = [
  {
    slug: "goluboy-kater",
    name: "Blue Wave",
    shortName: "Голубой катер",
    priceFrom: "4 990 ₽",
    capacity: "до 4 человек",
    description:
      "Лёгкий прогулочный катер для спокойного маршрута по воде, свидания или первой самостоятельной прогулки после инструктажа.",
    depositNote: "уточняется при бронировании",
    instructionNote: "бесплатно перед выходом на воду",
    engineNote: sharedEngineNote,
    comfort: sharedComfort,
    bestFor: ["свидание", "прогулка по Неве", "первая самостоятельная прогулка"],
    images: goluboy.images,
    thumbnails: goluboy.thumbnails,
  },
  {
    slug: "krasnyy-kater",
    name: "Red Star",
    shortName: "Красный катер",
    priceFrom: "4 990 ₽",
    capacity: "до 4 человек",
    description:
      "Яркий катер для прогулки с друзьями, дня рождения или фотосессии на воде.",
    depositNote: "уточняется при бронировании",
    instructionNote: "бесплатно перед выходом на воду",
    engineNote: sharedEngineNote,
    comfort: sharedComfort,
    bestFor: ["друзья", "день рождения", "фотосессия", "прогулка по Неве"],
    images: krasnyy.images,
    thumbnails: krasnyy.thumbnails,
  },
  {
    slug: "belyy-kater",
    name: "White Line",
    shortName: "Белый катер",
    priceFrom: "4 990 ₽",
    capacity: "до 4 человек",
    description:
      "Светлый прогулочный катер для аккуратной городской прогулки по Неве, каналам и маршрутам Петербурга.",
    depositNote: "уточняется при бронировании",
    instructionNote: "бесплатно перед выходом на воду",
    engineNote: sharedEngineNote,
    comfort: sharedComfort,
    bestFor: ["семья", "прогулка по Неве", "каналы Петербурга", "фотосессия"],
    images: belyy.images,
    thumbnails: belyy.thumbnails,
  },
  {
    slug: "zheltyy-kater",
    name: "Yellow Space",
    shortName: "Жёлтый катер",
    priceFrom: "4 990 ₽",
    capacity: "до 5 человек",
    description:
      "Заметный катер для небольшой компании, летней прогулки и ярких фотографий на воде.",
    depositNote: "уточняется при бронировании",
    instructionNote: "бесплатно перед выходом на воду",
    engineNote: sharedEngineNote,
    badge: "Единственный катер в парке до 5 человек",
    comfort: sharedComfort,
    bestFor: ["друзья", "фотосессия", "летняя прогулка", "закат на воде"],
    images: zheltyy.images,
    thumbnails: zheltyy.thumbnails,
  },
];

/** Фото без привязки к катеру — используется в hero */
export const unmatchedImages = ["/images/boats-webp/general/01.webp"];
