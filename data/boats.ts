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

function gallery(slug: string, count: number, altBase: string) {
  const images: string[] = [];
  const thumbnails: string[] = [];
  const imageAlts: string[] = [];
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");
    images.push(`/images/boats-webp/${slug}/${num}.webp`);
    thumbnails.push(`/images/boats-webp-thumbs/${slug}/${num}.webp`);
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

const blueWave = gallery("goluboy-kater", 3, "Blue Wave");
const sexySeaRed = gallery("krasnyy-kater", 6, "Sexy Sea Red");
const whiteShark = gallery("belyy-kater", 5, "White Shark");
const yellowSpace = gallery("zheltyy-kater", 6, "Yellow Space");
const tiffany = gallery("tiffany", 4, "Tiffany");
const totalBlack = gallery("total-black", 5, "Total Black");

/** Seven bookable boats — single source of truth for Fleet, form and API boatName */
export const boats: Boat[] = [
  {
    slug: "goluboy-kater",
    name: "Blue Wave",
    shortName: "Голубой катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    description:
      "Светло-голубой прогулочный катер для спокойного маршрута, свидания или первой самостоятельной прогулки после инструктажа.",
    comfort: sharedComfort,
    bestFor: ["свидание", "прогулка по Неве", "первая самостоятельная прогулка"],
    images: blueWave.images,
    thumbnails: blueWave.thumbnails,
    imageAlts: blueWave.imageAlts,
  },
  {
    slug: "krasnyy-kater",
    name: "Sexy Sea Red",
    shortName: "Красный катер",
    ...sharedSpecs,
    capacity: "до 5 человек",
    description:
      "Яркий красный катер для компании, дня рождения и эффектных фотографий на воде.",
    badge: "До 5 человек",
    comfort: sharedComfort,
    bestFor: ["друзья", "день рождения", "фотосессия", "прогулка по Неве"],
    images: sexySeaRed.images,
    thumbnails: sexySeaRed.thumbnails,
    imageAlts: sexySeaRed.imageAlts,
  },
  {
    slug: "belyy-kater",
    name: "White Shark",
    shortName: "Белая акула",
    ...sharedSpecs,
    capacity: "до 4 человек",
    description:
      "Бело-синий катер для аккуратной городской прогулки по Неве, каналам и маршрутам Петербурга.",
    comfort: sharedComfort,
    bestFor: ["семья", "прогулка по Неве", "каналы Петербурга", "фотосессия"],
    images: whiteShark.images,
    thumbnails: whiteShark.thumbnails,
    imageAlts: whiteShark.imageAlts,
  },
  {
    slug: "zheltyy-kater",
    name: "Yellow Space",
    shortName: "Жёлтый катер",
    ...sharedSpecs,
    capacity: "до 5 человек",
    description:
      "Заметный жёлтый катер для небольшой компании, летней прогулки и закатных видов у Лахты.",
    badge: "До 5 человек",
    comfort: sharedComfort,
    bestFor: ["друзья", "фотосессия", "летняя прогулка", "закат на воде"],
    images: yellowSpace.images,
    thumbnails: yellowSpace.thumbnails,
    imageAlts: yellowSpace.imageAlts,
  },
  {
    slug: "tiffany",
    name: "Tiffany",
    shortName: "Бирюзовый катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    description:
      "Бирюзовый катер для стильной прогулки, свидания и ярких кадров на воде.",
    comfort: sharedComfort,
    bestFor: ["свидание", "фотосессия", "прогулка по заливу"],
    images: tiffany.images,
    thumbnails: tiffany.thumbnails,
    imageAlts: tiffany.imageAlts,
  },
  {
    slug: "total-black",
    name: "Total Black",
    shortName: "Чёрный катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    description:
      "Полностью чёрный катер для премиальной вечерней прогулки и уверенного силуэта на воде.",
    comfort: sharedComfort,
    bestFor: ["романтика", "вечер на воде", "фотосессия"],
    images: totalBlack.images,
    thumbnails: totalBlack.thumbnails,
    imageAlts: totalBlack.imageAlts,
  },
  {
    slug: "red-black",
    name: "Red & Black",
    shortName: "Красно-чёрный катер",
    ...sharedSpecs,
    capacity: "до 4 человек",
    description:
      "Красно-чёрный катер для яркой самостоятельной прогулки. Актуальные фотографии модели уточнит менеджер при бронировании.",
    comfort: sharedComfort,
    bestFor: ["друзья", "день рождения", "прогулка по Неве"],
    // No confident unique photos in incoming drop — do not reuse other boats' images
    images: [],
    thumbnails: [],
    imageAlts: [],
  },
];

/** Names accepted by booking form / lead API */
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

/** Legacy unmatched hero frame — kept for reference, hero now uses dedicated asset */
export const unmatchedImages = ["/images/boats-webp/general/01.webp"];
