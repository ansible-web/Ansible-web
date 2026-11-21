# Ansible Web

<img src="public/icon-192x192.png" width="80" alt="Значок Ansible Web">

Браузерный клиент мессенджера Ansible. Чтобы открыть свои чаты, перейдите в веб-приложение и войдите в учётную запись Ansible. Устанавливать приложение на компьютер не требуется.

**[Открыть Ansible Web](https://web.ansible.su/)**

Ansible Web — независимый **форк Telegram Web A**, созданного Александром Зинчуком и участниками проекта. В основе интерфейса лежат TypeScript и Teact, для локальной разработки используется Vite. [Исходный проект Telegram Web A](https://github.com/Ajaxy/telegram-tt).

## Локальный запуск

Подготовьте Node.js и npm совместимых версий. Актуальные диапазоны указаны в разделе `engines` файла [package.json](package.json).

```sh
git clone https://github.com/ansible-web/Ansible-web.git
cd Ansible-web
cp .env.example .env
npm ci
```

В `.env` задайте `ANSIBLE_API_ID` и `ANSIBLE_API_HASH` своего приложения. Затем запустите сервер разработки и откройте адрес, который Vite выведет в терминале:

```sh
npm run dev
```

Для проверки изменений используйте `npm test` и `npm run check`.

## Лицензия и авторство

Клиент распространяется по GNU GPL. Условия лицензии, авторство Telegram Web A и сведения об изменениях форка приведены в репозитории. [Лицензия GPL версии 3](LICENSE) · [Сведения об авторах](NOTICE).

[Сайт Ansible](https://ansible.su) · [История изменений](CHANGELOG.md) · [Сообщить о проблеме](https://github.com/ansible-web/Ansible-web/issues)
