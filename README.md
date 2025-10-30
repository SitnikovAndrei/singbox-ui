# Sing-Box Configuration Editor

Web-based UI для редактирования конфигурации sing-box с использованием Vue.js 3 и Bootstrap 5.

## Особенности

- ✅ Редактирование всех секций конфигурации (DNS, Inbounds, Outbounds, Routes, Log)
- ✅ Компонентная архитектура на базе принципов SOLID
- ✅ Автоматическая загрузка и сохранение конфигурации через API
- ✅ Валидация и обработка ошибок
- ✅ Responsive дизайн на Bootstrap 5

## Установка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build
```

## Структура проекта

```
src/
├── components/          # Vue компоненты
│   ├── DnsConfig.vue
│   ├── InboundsConfig.vue
│   ├── OutboundsConfig.vue
│   ├── RoutesConfig.vue
│   └── LogConfig.vue
├── services/            # Сервисы (SOLID: Single Responsibility)
│   └── ConfigService.js
├── App.vue              # Главный компонент
└── main.js              # Точка входа
```

## Архитектура (SOLID принципы)

### Single Responsibility Principle (SRP)
- Каждый компонент отвечает за свою секцию конфига
- ConfigService занимается только HTTP запросами

### Open/Closed Principle (OCP)
- Компоненты расширяемы через props и events
- Легко добавить новые типы outbound/inbound

### Liskov Substitution Principle (LSP)
- Все компоненты следуют единому интерфейсу (props: config, emit: update)

### Interface Segregation Principle (ISP)
- Компоненты получают только нужные им данные через props

### Dependency Inversion Principle (DIP)
- App.vue зависит от абстракции ConfigService, а не от конкретной реализации axios

## API Endpoints

```javascript
// Получение конфига
GET http://192.168.1.1/cgi-bin/api.uc?file=/etc/sing-box/config.json

// Сохранение конфига
POST http://192.168.1.1/cgi-bin/api.uc?file=/etc/sing-box/config.json
Content-Type: application/json
```

## Использование

1. Откройте приложение в браузере
2. Конфигурация загрузится автоматически
3. Редактируйте нужные секции через вкладки
4. Нажмите "Save Configuration" для сохранения

## Настройка прокси для разработки

В `vite.config.js` настроен прокси на `http://192.168.1.1`. Если ваш роутер имеет другой адрес, измените:

```javascript
server: {
  proxy: {
    '/cgi-bin': {
      target: 'http://YOUR_ROUTER_IP',
      changeOrigin: true
    }
  }
}
```

## Технологии

- Vue.js 3 (Composition API)
- Bootstrap 5
- Axios
- Vite

## Лицензия

MIT