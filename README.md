# Socvet Bloom Bouquet Studio

Собери сайт для Цветы как искусство Авторская флористика, необычные сочетания, выразительные букетыКрупные фотографии, скульптурные композиции, смелая типографика. Главная идея бренда: «Чувства обретают форму». Название бренда: СОЦВЕТСозвучие цветов и оттенковТёплый, выразительный.



Элемент

Решение

Палитра

Тёплый молочный, чернильный, глубокий бордовый

Логотип

Выразительная надпись «ИЗГИБ» с одной пластичной деталью в буквах

Типографика

Крупные художественные заголовки и простой, хорошо читаемый текст

Изображения

Авторские букеты со свободными силуэтами, боковой свет, заметные тени

Композиция сайта

Много воздуха, крупные фотографии, чередование спокойных и насыщенных блоков

 Москва - (распиши структуру подробнее: не забудь - основная панель, каталог, карточка товара, корзина, хедер, футер, доставка, политика конфиденциальности и оферта) + небольшую админку, куда будут уходить заявки и можно будет добавлять и редактировать товары. Стиль легкий, весенний, романтичный, при этом уйди от стандартного шаблона интернет-магазина.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://socvet-bloom-bouquet-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91fc076b-a658-48a5-86f3-b5598c6380df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Каталог

Каталог и фотографии используют Supabase; корзина работает в браузере.
Инструкции для перехода с прежнего магазина и применения миграции:
[Каталог без Shopify](docs/native-catalog.md).

## ИИ-консультант

Подбор букетов и ответы о доставке/уходе через OpenAI на сервере.
Активация, переменные окружения и ограничения: [инструкция](docs/ai-consultant.md).
Виджет скрыт до включения `VITE_CONSULTANT_ENABLED=true`; серверу дополнительно
нужны `CONSULTANT_ENABLED=true` и секрет `OPENAI_API_KEY`.
