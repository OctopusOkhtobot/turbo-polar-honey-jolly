/** Fixed calm female voice (Liora, Arabic). Same on every presentation laptop. */
const clips = {
  welcome: "/voice/welcome.mp3",
  praise: "/voice/praise.mp3",
  gentle: "/voice/gentle.mp3",
  near: "/voice/near.mp3",
  listen: "/voice/listen.mp3",
  heard: "/voice/heard.mp3",
  retry: "/voice/retry.mp3",
  done: "/voice/done.mp3",
} as const;

export type NoonaClip = keyof typeof clips;

let current: HTMLAudioElement | null = null;

export function playNoona(clip: NoonaClip) {
  if (typeof Audio === "undefined") return;
  current?.pause();
  const audio = new Audio(clips[clip]);
  current = audio;
  audio.play().catch(() => {
    /* autoplay can fail before a tap; the next answer is a gesture */
  });
}

const femaleHint = /female|woman|hoda|salma|laila|layla|maysa|zeina|amira|noor|noura|sara|hala|lina/i;

/** Long explanations only. Reactions use the fixed clips above. */
export function speakArabic(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  const run = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";
    utter.rate = 0.9;
    utter.pitch = 1.04;
    const voices = speechSynthesis.getVoices();
    const arabic = voices.filter((voice) => voice.lang.toLowerCase().startsWith("ar"));
    utter.voice = arabic.find((voice) => femaleHint.test(voice.name)) ?? arabic[0];
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener("voiceschanged", run, { once: true });
    return;
  }
  run();
}
