# 📱 Claude Mobile Terminal

Доступ к Claude Code с мобильного телефона через WiFi — полноценный терминал в браузере.

## Быстрый старт

### 1. Установи зависимости

```bash
cd claude-mobile
npm install
```

> **Windows**: для `node-pty` нужны build tools. Если ещё не установлены:
> ```bash
> npm install -g windows-build-tools
> ```
> Или установи Visual Studio Build Tools с компонентом "Desktop development with C++".

### 2. Запусти сервер

```bash
npm start
```

В консоли появится что-то вроде:

```
  ╔═══════════════════════════════════════════════╗
  ║     🚀  Claude Mobile Terminal  🚀            ║
  ║  Local:   http://localhost:3033              ║
  ║  Network: http://192.168.1.42:3033           ║
  ╚═══════════════════════════════════════════════╝
```

### 3. Открой на телефоне

Открой **Network URL** в браузере телефона (телефон и компьютер должны быть в одной WiFi сети).

### 4. Запусти Claude Code

В открывшемся терминале набери:
```
claude
```

## Фичи

- 🖥️ **Полноценный терминал** — xterm.js с поддержкой цветов и ANSI
- 📱 **Мобильная оптимизация** — адаптивный размер, поддержка виртуальной клавиатуры
- ⌨️ **Быстрые клавиши** — панель с Ctrl+C, Esc, Tab, стрелками и кнопкой запуска Claude
- 🔄 **Авто-реконнект** — при потере соединения появится кнопка переподключения
- 🎨 **Тёмная тема** — приятные для глаз цвета

## Настройка

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `PORT`    | `3033`      | Порт сервера |

```bash
PORT=8080 npm start
```

## Troubleshooting

**Не могу подключиться с телефона**
- Убедись, что телефон и компьютер в одной WiFi сети
- Проверь файрвол — разреши входящие на порт 3033
- Windows: `netsh advfirewall firewall add rule name="Claude Terminal" dir=in action=allow protocol=TCP localport=3033`

**node-pty не устанавливается**
- Windows: нужны Visual Studio Build Tools + Python
- macOS: `xcode-select --install`
- Linux: `sudo apt install build-essential python3`
