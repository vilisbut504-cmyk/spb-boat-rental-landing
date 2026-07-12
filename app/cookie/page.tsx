import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/LegalLayout";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Использование cookie — " + site.name,
};

export default function CookiePage() {
  return (
    <LegalLayout title="Использование файлов cookie" updated="17 июня 2026">
      <p className="text-sm leading-relaxed">
        Сайт {site.name} использует файлы cookie, чтобы сделать работу с ним
        удобнее и анализировать посещаемость.
      </p>

      <Section heading="1. Что такое cookie">
        <p>
          Cookie — это небольшие текстовые файлы, которые сохраняются в вашем
          браузере при посещении сайта и помогают запоминать ваши настройки.
        </p>
      </Section>

      <Section heading="2. Какие cookie мы используем">
        <p>
          Мы используем технические cookie для корректной работы сайта и
          аналитические cookie для оценки эффективности страниц и рекламы.
        </p>
      </Section>

      <Section heading="3. Управление cookie">
        <p>
          Вы можете отключить cookie в настройках своего браузера. При этом
          часть функций сайта может работать некорректно.
        </p>
      </Section>

      <Section heading="4. Контакты">
        <p>
          Вопросы по использованию cookie направляйте по телефону{" "}
          <a href={site.phoneHref} className="text-navy-600 underline">
            {site.phoneDisplay}
          </a>{" "}
          или в Telegram{" "}
          <a
            href={site.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-navy-600 underline"
          >
            {site.telegramUsername}
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
