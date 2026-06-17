# spb-boat-rental-landing

Коммерческий лендинг аренды катеров в Санкт-Петербурге. Прогулки по Неве и
каналам, развод мостов, индивидуальные маршруты.

## Стек

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- npm

## Структура проекта

```
app/
  layout.tsx          # корневой layout: шрифты, мета, Header, Footer
  page.tsx            # главная страница лендинга
  globals.css         # глобальные стили и тема Tailwind
  privacy/            # политика конфиденциальности
  terms/              # пользовательское соглашение
  rental-rules/       # правила аренды
  cookie/             # использование cookie
components/           # секции и переиспользуемые UI-компоненты
data/                 # контент: катера, маршруты, FAQ, контакты
public/images/        # изображения (плейсхолдеры / реальные фото)
```

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Сборка

```bash
npm run build
npm run start
```

## Дальнейшие шаги

- Подключить реальные фотографии катеров в `public/images/`.
- Добавить отправку формы бронирования на бэкенд / CRM.
- Настроить аналитику и SEO-разметку.
```
