"use client";

/**
 * Couche voix MVP — Web Speech API du navigateur (gratuite, sans clé). Prototype démontrable :
 * STT (dictée) pour la prise de parole, TTS (synthèse) pour la voix des juges. À remplacer par
 * Whisper + un vrai TTS (1 voix/persona) en V2 ; l'interface reste la même.
 */

type SR = typeof window extends { SpeechRecognition: infer T } ? T : unknown;

/** Reconnaissance vocale disponible ? (Chrome/Edge : oui ; Firefox : non.) */
export function speechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR })
      .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SR }).webkitSpeechRecognition,
  );
}

/** Lit un texte à voix haute. `seed` (nom du juge) module pitch/voix → un timbre par juge. */
export function speak(text: string, seed = ""): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const clean = text.replace(/^[^:]+:\s*/, ""); // enlève « Mme Diallo : »
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "fr-FR";
  const h = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  u.pitch = 0.8 + (h % 5) * 0.12;
  u.rate = 0.96 + (h % 3) * 0.06;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("fr"));
  if (voices.length) u.voice = voices[h % voices.length];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** Stoppe toute lecture en cours. */
export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

interface Recognizer {
  start: () => void;
  stop: () => void;
}

/** Dictée : chaque phrase reconnue est passée à `onResult`. `null` si non supporté. */
export function createRecognizer(
  onResult: (text: string) => void,
  onEnd: () => void,
): Recognizer | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => unknown })
      .webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor() as {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: (e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  };
  rec.lang = "fr-FR";
  rec.continuous = true;
  rec.interimResults = false;
  rec.onresult = (e) => {
    let text = "";
    for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
    if (text.trim()) onResult(text.trim());
  };
  rec.onend = onEnd;
  return { start: () => rec.start(), stop: () => rec.stop() };
}
