export type Boat = {
  id: string;
  name: string;
  capacity: string;
  format: string;
  access: string;
  price: string;
  image: string;
};

export const boats: Boat[] = [
  {
    id: "classic",
    name: "Прогулочный катер Classic",
    capacity: "до 5 человек",
    format: "спокойная прогулка по воде",
    access: "уточняются при бронировании",
    price: "условия уточняются",
    image: "/images/boat-classic.svg",
  },
  {
    id: "comfort",
    name: "Катер Comfort",
    capacity: "до 6 человек",
    format: "компания, день рождения, фотосессия",
    access: "уточняются при бронировании",
    price: "условия уточняются",
    image: "/images/boat-comfort.svg",
  },
  {
    id: "sunset",
    name: "Катер Sunset",
    capacity: "до 4 человек",
    format: "свидание, закат, фото",
    access: "уточняются при бронировании",
    price: "условия уточняются",
    image: "/images/boat-sunset.svg",
  },
];
