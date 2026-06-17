export const site = {
  name: "Нева Чартер",
  tagline: "Аренда катеров в Санкт-Петербурге",
  phone: "+7 (812) 000-00-00",
  phoneHref: "tel:+78120000000",
  email: "hello@neva-charter.ru",
  telegram: "https://t.me/",
  whatsapp: "https://wa.me/",
  address: "Санкт-Петербург, наб. реки Мойки",
  workHours: "Ежедневно 09:00 – 23:00",
} as const;

export const navLinks = [
  { href: "#fleet", label: "Катера" },
  { href: "#routes", label: "Маршруты" },
  { href: "#pricing", label: "Цены" },
  { href: "#steps", label: "Как заказать" },
  { href: "#faq", label: "Вопросы" },
] as const;

export const legalLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/rental-rules", label: "Правила аренды" },
  { href: "/cookie", label: "Использование cookie" },
] as const;
