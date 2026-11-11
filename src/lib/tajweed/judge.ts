/** Fold Arabic so a student's speech or typing can be compared to the lesson. */
export function arabicFold(input: string): string {
  return input
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\u0621-\u064A\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(word: string) {
  return word.replace(/^(ال|و|ف|ب|ل)/, "");
}

function closeWord(heard: string, expected: string) {
  if (heard === expected) return true;
  const shorter = heard.length < expected.length ? heard : expected;
  const longer = heard.length < expected.length ? expected : heard;
  if (shorter.length < 3) return false;
  if (!longer.includes(shorter)) return false;
  return shorter.length / longer.length >= 0.66;
}

export function phraseScore(heard: string, expected: string): number {
  const heardWords = arabicFold(heard).split(" ").map(stem).filter((word) => word.length >= 2);
  const expectedWords = arabicFold(expected).split(" ").map(stem).filter((word) => word.length >= 2);
  if (!expectedWords.length || !heardWords.length) return 0;
  let hit = 0;
  for (const word of expectedWords) {
    if (heardWords.some((said) => closeWord(said, word))) hit += 1;
  }
  return hit / expectedWords.length;
}

const LABELS: Record<string, string[]> = {
  izhar: ["اظهار حلقي", "الاظهار الحلقي", "اظهار"],
  "idgham-gh": ["ادغام بغنه", "بغنه"],
  "idgham-nogh": ["ادغام بغير غنه", "ادغام بلا غنه", "بغير غنه", "بلا غنه"],
  iqlab: ["اقلاب", "الاقلاب"],
  ikhfa: ["اخفاء حقيقي", "الاخفاء الحقيقي", "اخفاء"],
  mutlaq: ["اظهار مطلق", "الاظهار المطلق"],
};

export type TextVerdict = "right" | "partial" | "wrong";

export function judgeText(text: string, correct: string): TextVerdict {
  const folded = arabicFold(text);
  if (!folded) return "wrong";
  if (correct === "mutlaq") return folded.includes("مطلق") ? "right" : "wrong";
  if (correct === "izhar") {
    if (folded.includes("مطلق") || folded.includes("ادغام") || folded.includes("اخفاء") || folded.includes("اقلاب")) {
      return "wrong";
    }
  }
  if ((correct === "idgham-gh" || correct === "idgham-nogh") && folded.includes("ادغام") && !folded.includes("غن")) {
    return "partial";
  }
  const keys = LABELS[correct] ?? [];
  return keys.some((key) => folded.includes(arabicFold(key))) ? "right" : "wrong";
}
