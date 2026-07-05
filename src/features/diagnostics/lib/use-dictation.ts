"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictée vocale (voix → texte) via la Web Speech API — plus facile pour un novice
 * que taper. Dégrade en silence si le navigateur ne la supporte pas (Safari, etc.).
 * Le texte final est renvoyé par bouts via `onText` ; la langue suit la locale.
 */

// Types minimaux de la Web Speech API (non fournis par la lib TS par défaut).
interface SRAlternative {
  transcript: string;
}
interface SRResult {
  isFinal: boolean;
  0: SRAlternative;
}
interface SREvent {
  resultIndex: number;
  results: { length: number; [index: number]: SRResult };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type SRWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export function useDictation(locale: string, onText: (chunk: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextRef = useRef(onText);

  // Garde la dernière callback sans recréer l'instance de reconnaissance.
  useEffect(() => {
    onTextRef.current = onText;
  });

  useEffect(() => {
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    // Détection post-montage (évite un mismatch d'hydratation sur le bouton micro).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);

    const rec = new Ctor();
    rec.lang = locale === "en" ? "en-US" : "fr-FR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let finalChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalChunk += e.results[i][0].transcript;
      }
      if (finalChunk.trim()) onTextRef.current(finalChunk.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        // rien : déjà arrêté
      }
    };
  }, [locale]);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        // start() peut lever si déjà démarré → on ignore
      }
    }
  }, [listening]);

  return { supported, listening, toggle };
}
