export type Boat = {
  id: string;
  name: string;
  type: string;
  guests: number;
  pricePerHour: number;
  features: string[];
  gradient: string;
};

export const boats: Boat[] = [
  {
    id: "aurora",
    name: "Аврора",
    type: "Открытый прогулочный катер",
    guests: 8,
    pricePerHour: 6500,
    features: ["Капитан", "Плед и зонт", "Музыка Bluetooth"],
    gradient: "from-navy-700 via-navy-500 to-navy-400",
  },
  {
    id: "neva",
    name: "Нева",
    type: "Катер-кабриолет с тентом",
    guests: 12,
    pricePerHour: 9000,
    features: ["Капитан", "Мягкий салон", "Тёплый тент"],
    gradient: "from-navy-800 via-navy-600 to-navy-500",
  },
  {
    id: "belie-nochi",
    name: "Белые ночи",
    type: "Премиальный катер для торжеств",
    guests: 16,
    pricePerHour: 14000,
    features: ["Капитан и хостес", "Бар-зона", "Подсветка"],
    gradient: "from-navy-900 via-navy-700 to-navy-500",
  },
];
