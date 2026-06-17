export const site = {
  name: "Катер без капитана",
  city: "Санкт-Петербург",
  tagline: "Аренда катера без капитана в Санкт-Петербурге",
  phone: "+7 (812) 000-00-00",
  phoneHref: "tel:+78120000000",
  email: "hello@kater-bez-kapitana.ru",
  telegram: "https://t.me/",
  address: "Санкт-Петербург",
  workHours: "Ежедневно 09:00 – 23:00",
} as const;

export const navLinks = [
  { href: "#advantages", label: "Преимущества" },
  { href: "#boats", label: "Катера" },
  { href: "#routes", label: "Маршруты" },
  { href: "#safety", label: "Безопасность" },
  { href: "#conditions", label: "Условия" },
  { href: "#faq", label: "FAQ" },
] as const;

export const legalLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/rental-rules", label: "Правила аренды" },
  { href: "/cookie", label: "Использование cookie" },
] as const;
