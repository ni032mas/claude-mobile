# Voice Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add voice input to Claude Mobile Terminal with speech-to-text and voice commands.

**Architecture:** Web Speech API for recognition, toggle button UX, voice commands map for quick actions (yes/no/cancel), fallback to text input for unrecognized speech. Separate JS module for voice logic.

**Tech Stack:** Web Speech API, vanilla JavaScript ES6 module

---

## Task 1: Create Voice Input Module

**Files:**
- Create: `public/js/voice-input.js`

**Step 1: Create the module file**

```javascript
// Voice input module using Web Speech API

const VOICE_COMMANDS = {
  // Russian
  "да": "y",
  "нет": "n",
  "отмена": "\x03",
  "ввод": "\r",
  "клод": "claude\r",
  // English
  "yes": "y",
  "no": "n",
  "cancel": "\x03",
  "enter": "\r",
  "claude": "claude\r"
};

export class VoiceInput {
  constructor(onResult, onError) {
    this.onResult = onResult;
    this.onError = onError;
    this.isListening = false;
    this.recognition = null;

    this._init();
  }

  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onError?.("not-supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "ru-RU";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const command = VOICE_COMMANDS[transcript];
      const output = command || transcript + "\r";
      this.onResult?.(output, !!command);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  static isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  toggle() {
    if (!this.recognition) return false;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }

    return this.isListening;
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
```

**Step 2: Commit**

```bash
git add public/js/voice-input.js
git commit -m "feat: add voice input module with Web Speech API"
```

---

## Task 2: Add Voice Button Styles

**Files:**
- Modify: `public/index.html` (CSS section)

**Step 1: Add styles for voice button**

Add after `.qk.accent` styles (~line 142):

```css
#voice-btn.listening {
  background: var(--red);
  color: white;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

#voice-btn.unsupported {
  display: none;
}
```

**Step 2: Commit**

```bash
git add public/index.html
git commit -m "style: add voice button listening state styles"
```

---

## Task 3: Add Voice Button to Quickkeys

**Files:**
- Modify: `public/index.html` (HTML section)

**Step 1: Add voice button at the start of quickkeys**

Find `<div id="quickkeys">` and add as first button:

```html
<div id="quickkeys">
  <button class="qk" id="voice-btn">🎤</button>
  <button class="qk accent" data-send="claude\r">claude</button>
  ...
```

**Step 2: Commit**

```bash
git add public/index.html
git commit -m "feat: add voice button to quickkeys toolbar"
```

---

## Task 4: Integrate Voice Module

**Files:**
- Modify: `public/index.html` (script section)

**Step 1: Import module and initialize**

Add at the start of `<script>` section:

```javascript
import { VoiceInput } from './js/voice-input.js';
```

**Note:** Change `<script>` to `<script type="module">` for ES6 imports.

**Step 2: Initialize voice input after terminal setup**

Add after `connect();` call:

```javascript
// Voice input setup
const voiceBtn = document.getElementById("voice-btn");

if (!VoiceInput.isSupported()) {
  voiceBtn.classList.add("unsupported");
} else {
  const voice = new VoiceInput(
    // onResult
    (text, isCommand) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data: text }));
      }
      voiceBtn.classList.remove("listening");
    },
    // onError
    (error) => {
      console.warn("Voice error:", error);
      voiceBtn.classList.remove("listening");
    }
  );

  voiceBtn.addEventListener("click", () => {
    const listening = voice.toggle();
    voiceBtn.classList.toggle("listening", listening);
    term.focus();
  });
}
```

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: integrate voice input with terminal"
```

---

## Task 5: Test and Verify

**Step 1: Start server**

```bash
npm start
```

**Step 2: Manual testing checklist**

- [ ] Open on mobile browser
- [ ] Voice button visible (🎤)
- [ ] Click → button turns red, starts listening
- [ ] Say "да" → sends "y" to terminal
- [ ] Say "привет мир" → sends "привет мир\r"
- [ ] Click again → stops listening
- [ ] In unsupported browser → button hidden

**Step 3: Final commit if needed**

```bash
git add -A
git commit -m "fix: voice input adjustments after testing"
```

---

## Summary

| File | Action |
|------|--------|
| `public/js/voice-input.js` | Create (new module) |
| `public/index.html` | Modify (CSS + HTML + JS) |

**Total commits:** 4-5
**Estimated time:** 15-20 min
