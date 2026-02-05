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
  constructor(onResult, onError, onEnd) {
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
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

    this.recognition.onstart = () => {
      console.log("[Voice] Started listening");
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log("[Voice] Recognized:", transcript);
      const command = VOICE_COMMANDS[transcript];
      const output = command || transcript + "\r";
      this.onResult?.(output, !!command);
    };

    this.recognition.onerror = (event) => {
      console.warn("[Voice] Error:", event.error);
      this.isListening = false;
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      console.log("[Voice] Ended");
      this.isListening = false;
      this.onEnd?.();
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
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        this.isListening = false;
        this.onError?.("start: " + e.message);
      }
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
