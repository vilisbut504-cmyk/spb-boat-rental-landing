export const site = {
  name: "Катер без капитана",
  brandSubtitle: "аренда без капитана",
  city: "Санкт-Петербург",
  tagline: "Аренда катера без капитана в Санкт-Петербурге",
  phoneDisplay: "+7 981 252-69-69",
  phoneHref: "tel:+79812526969",
  phoneAriaLabel: "Позвонить по номеру +7 981 252-69-69",
  telegramUrl: "https://t.me/KATER_BEZKAPITANA",
  telegramUsername: "@KATER_BEZKAPITANA",
  telegramAriaLabel: "Открыть Telegram Катер без капитана",
  vkUrl: "https://vk.ru/arendabezkapitana",
  vkLabel: "Катер без капитана ВКонтакте",
  vkAriaLabel: "Открыть сообщество Катер без капитана ВКонтакте",
  address: "Санкт-Петербург, Левашовский проспект, дом 19",
  addressShort: "Левашовский проспект, дом 19",
  landmark: "Парковка у реки Карповки",
  telegramQr: "/images/contacts/telegram-qr.png",
} as const;

export const navLinks = [
  { href: "#advantages", label: "Преимущества" },
  { href: "#boats", label: "Катера" },
  { href: "#routes", label: "Маршруты" },
  { href: "#tariffs", label: "Тарифы" },
  { href: "#safety", label: "Безопасность" },
  { href: "#faq", label: "FAQ" },
] as const;

export const legalLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/rental-rules", label: "Правила аренды" },
  { href: "/cookie", label: "Использование cookie" },
] as const;
