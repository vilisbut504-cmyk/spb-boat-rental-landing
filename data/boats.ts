export type Boat = {
  slug: string;
  name: string;
  shortName?: string;
  priceFrom?: string;
  capacity?: string;
  /** Structured max guest count — single source for form and API validation */
  maxGuests: number;
  year?: string;
  engine?: string;
  power?: string;
  maxSpeed?: string;
  fuelTank?: string;
  comfort?: string[];
  bestFor?: string[];
  description?: string;
  instructionNote?: string;
  bookingNote?: string;
  badge?: string;
  bookable: boolean;
  images: string[];
  thumbnails: string[];
  imageAlts?: string[];
};

export type FleetPromoCard = {
  kind: "promo";
  id: "fleet-promo";
  title: string;
  description: string;
};

/** Gallery from named WebP files: /images/boats-webp/{slug}/{prefix}-01.webp */
function gallery(
  slug: string,
  prefix: string,
  count: number,
  altBase: string
) {
  const images: string[] = [];
  const thumbnails: string[] = [];
  const imageAlts: string[] = [];
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");
    const file = `${prefix}-${num}.webp`;
    images.push(`/images/boats-webp/${slug}/${file}`);
    thumbnails.push(`/images/boats-webp-thumbs/${slug}/${file}`);
    imageAlts.push(`${altBase} — фото ${i}`);
  }
  return { images, thumbnails, imageAlts };
}

const sharedComfort = [
  "кожаные сиденья",
  "пледы",
  "карта маршрута",
  "спасательные жилеты",
  "место для хранения вещей",
  "портативная колонка для музыки",
];

const sharedSpecs = {
  year: "2026",
  engine: "Японский четырёхтактный инжекторный мотор",
  power: "9,9 л. с.",
  maxSpeed: "40–50 км/ч",
  fuelTank: "20 л",
  priceFrom: "4 990 ₽",
  instructionNote: "бесплатный подробный инструктаж перед выходом",
  bookingNote: "Бронь: 1 000 ₽ в счёт катания",
  bookable: true as const,
};

const tiffanyGallery = gallery("tiffany", "tiffany", 4, "Tiffany");
const sexySeaRedGallery = gallery(
  "krasnyy-kater",
  "sexy-sea-red",
  6,
  "Sexy Sea Red"
);
const redSharkGallery = gallery("red-shark", "red-shark", 6, "Red Shark");
const totalBlackGallery = gallery(
  "total-black",
  "total-black",
  5,
  "Total Black"
);
const yellowSpaceGallery = gallery(
  "zheltyy-kater",
  "yellow-space",
  5,
  "Yellow Space"
);
const whiteSharkGallery = gallery(
  "belyy-kater",
  "white-shark",
  5,
  "White Shark"
);

/**
 * Seven bookable boats — single source of truth for Fleet, form and API.
 * Order matches owner-confirmed fleet list.
 * Red & Black reuses Total Black WebP URLs (no physical duplicates).
 */
export const boats: Boat[] = [
  {
    slug: "tiffany",
    name: "Tiffany",
    shortName: "Синий катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    maxGuests: 4,
    description:
      "Синий катер Tiffany для стильной прогулки, свидания и ярких кадров на воде.",
    comfort: sharedComfort,
    bestFor: ["свидание", "фотосессия", "прогулка по заливу"],
    images: tiffanyGallery.images,
    thumbnails: tiffanyGallery.thumbnails,
    imageAlts: tiffanyGallery.imageAlts,
  },
  {
    slug: "krasnyy-kater",
    name: "Sexy Sea Red",
    shortName: "Красный катер",
    ...sharedSpecs,
    capacity: "до 5 человек",
    maxGuests: 5,
    description:
      "Яркий красный катер для компании, дня рождения и эффектных фотографий на воде.",
    badge: "До 5 человек",
    comfort: sharedComfort,
    bestFor: ["друзья", "день рождения", "фотосессия", "прогулка по Неве"],
    images: sexySeaRedGallery.images,
    thumbnails: sexySeaRedGallery.thumbnails,
    imageAlts: sexySeaRedGallery.imageAlts,
  },
  {
    slug: "red-shark",
    name: "Red Shark",
    shortName: "Красная акула",
    ...sharedSpecs,
    capacity: "до 4 человек",
    maxGuests: 4,
    description:
      "Красная акула — самостоятельный красный катер для уверенной прогулки по Неве и каналам.",
    comfort: sharedComfort,
    bestFor: ["друзья", "прогулка по Неве", "фотосессия"],
    images: redSharkGallery.images,
    thumbnails: redSharkGallery.thumbnails,
    imageAlts: redSharkGallery.imageAlts,
  },
  {
    slug: "total-black",
    name: "Total Black",
    shortName: "Чёрный катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    maxGuests: 4,
    description:
      "Полностью чёрный катер для премиальной вечерней прогулки и уверенного силуэта на воде.",
    comfort: sharedComfort,
    bestFor: ["романтика", "вечер на воде", "фотосессия"],
    images: totalBlackGallery.images,
    thumbnails: totalBlackGallery.thumbnails,
    imageAlts: totalBlackGallery.imageAlts,
  },
  {
    slug: "red-black",
    name: "Red & Black",
    shortName: "Красно-чёрный катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    maxGuests: 4,
    description:
      "Красно-чёрный катер для яркой самостоятельной прогулки. Отдельная модель парка с собственной бронью.",
    comfort: sharedComfort,
    bestFor: ["друзья", "день рождения", "прогулка по Неве"],
    // Same physical WebP set as Total Black (owner-approved)
    images: totalBlackGallery.images,
    thumbnails: totalBlackGallery.thumbnails,
    imageAlts: totalBlackGallery.images.map(
      (_, i) => `Red & Black — фото ${i + 1}`
    ),
  },
  {
    slug: "zheltyy-kater",
    name: "Yellow Space",
    shortName: "Жёлтый катер",
    ...sharedSpecs,
    capacity: "до 5 человек",
    maxGuests: 5,
    description:
      "Заметный жёлтый катер для небольшой компании, летней прогулки и закатных видов у Лахты.",
    badge: "До 5 человек",
    comfort: sharedComfort,
    bestFor: ["друзья", "фотосессия", "летняя прогулка", "закат на воде"],
    images: yellowSpaceGallery.images,
    thumbnails: yellowSpaceGallery.thumbnails,
    imageAlts: yellowSpaceGallery.imageAlts,
  },
  {
    slug: "belyy-kater",
    name: "White Shark",
    shortName: "Белая акула",
    ...sharedSpecs,
    capacity: "до 4 человек",
    maxGuests: 4,
    description:
      "Белая акула — светлый катер для аккуратной городской прогулки по Неве, каналам и маршрутам Петербурга.",
    comfort: sharedComfort,
    bestFor: ["семья", "прогулка по Неве", "каналы Петербурга", "фотосессия"],
    images: whiteSharkGallery.images,
    thumbnails: whiteSharkGallery.thumbnails,
    imageAlts: whiteSharkGallery.imageAlts,
  },
];

/** Names accepted by booking form / lead API — exactly seven boats */
export const bookableBoatNames = boats
  .filter((b) => b.bookable)
  .map((b) => b.name);

export const fleetPromoCard: FleetPromoCard = {
  kind: "promo",
  id: "fleet-promo",
  title: "Всегда ищем новые катера для вас",
  description:
    "Мы регулярно обновляем парк и добавляем новые модели и цвета.",
};
