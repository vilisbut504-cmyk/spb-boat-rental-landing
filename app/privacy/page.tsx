import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/LegalLayout";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — " + site.name,
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Политика конфиденциальности" updated="17 июня 2026">
      <p className="text-sm leading-relaxed">
        Настоящая политика описывает, как {site.name} обрабатывает и защищает
        персональные данные пользователей сайта при бронировании аренды
        катеров.
      </p>

      <Section heading="1. Какие данные мы собираем">
        <p>
          Мы собираем имя, номер телефона и комментарии, которые вы указываете
          в форме бронирования, а также технические данные (cookie, IP-адрес).
        </p>
      </Section>

      <Section heading="2. Цели обработки">
        <p>
          Данные используются для связи с вами, подтверждения брони, оказания
          услуги аренды и улучшения качества сервиса.
        </p>
      </Section>

      <Section heading="3. Передача данных">
        <p>
          Мы не передаём персональные данные третьим лицам, за исключением
          случаев, предусмотренных законодательством Российской Федерации.
        </p>
      </Section>

      <Section heading="4. Хранение и защита">
        <p>
          Данные хранятся не дольше, чем это необходимо для целей обработки. Мы
          применяем организационные и технические меры для их защиты.
        </p>
      </Section>

      <Section heading="5. Контакты">
        <p>
          По вопросам обработки данных звоните по телефону{" "}
          <a href={site.phoneHref} className="text-navy-600 underline">
            {site.phoneDisplay}
          </a>{" "}
          или пишите в Telegram{" "}
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
