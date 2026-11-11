import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ayahs } from "@/lib/tajweed/ayahs";
import { quiz, spotById, type QuizQuestion } from "@/lib/tajweed/data";
import { playNoona } from "@/lib/noona-voice";
import { AyahCaption, AyahText, ListenButton } from "./ayah-text";
import { Fireworks } from "./fireworks";
import { GhostButton, PrimaryButton } from "./ui";

type Miss = { prompt: string; explain: string };

export function QuizView({ onMajlis }: { onMajlis: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [lastRight, setLastRight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("noona-quiz-best");
    if (stored) setBest(Number(stored));
  }, []);

  const question = quiz[index];

  function choose(id: string) {
    if (picked || !question) return;
    setPicked(id);
    const right = id === question.correct;
    setLastRight(right);
    if (right) {
      setCorrectCount((count) => count + 1);
      setBurst((value) => value + 1);
      playNoona("praise");
    } else {
      playNoona("gentle");
      setMisses((list) => [...list, { prompt: question.prompt, explain: question.explain }]);
    }
  }

  function next() {
    if (index + 1 >= quiz.length) {
      const score = correctCount;
      setDone(true);
      playNoona(score >= quiz.length - 2 ? "done" : "praise");
      setBurst((value) => value + 1);
      setBest((prev) => {
        const value = Math.max(prev ?? 0, score);
        localStorage.setItem("noona-quiz-best", String(value));
        return value;
      });
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setMisses([]);
    setCorrectCount(0);
    setDone(false);
    setLastRight(false);
  }

  if (done) {
    return (
      <section className="panel space-y-4 p-5 md:p-8">
        <Fireworks token={burst} />
        <div className="flex items-center gap-4">
          <img
            src={correctCount >= quiz.length / 2 ? "/noona-happy.jpg" : "/noona-face.jpg"}
            alt="نونة"
            className="noona-pop h-24 w-24 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-gold">نتيجة التدريب</p>
            <h2 className="text-4xl text-emerald-deep">
              {correctCount} من {quiz.length}
            </h2>
          </div>
        </div>
        <p>
          {correctCount === quiz.length
            ? "أحسنتِ. الباب مستقر، والجلسة التالية مع نونة تثبيت لفظ."
            : "كل خطأ بقي معه تصحيحه. أعيدي المواضع الهادئة، لا الدرجة."}
        </p>
        <p className="text-sm text-muted">
          {best !== null ? `أحسن نتيجة محفوظة على هذا الجهاز: ${best} من ${quiz.length}.` : ""}
        </p>
        {misses.length ? (
          <div className="space-y-3">
            <h3 className="text-xl text-clay">ما يُعاد شرحه</h3>
            {misses.map((miss) => (
              <article key={miss.prompt} className="rounded-control bg-clay-soft p-4">
                <p className="font-medium">{miss.prompt}</p>
                <p className="mt-1 text-sm">{miss.explain}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>أحكام الباب واضحة. الجلسة التالية مع نونة تثبيت لفظ لا حفظ حروف.</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton onClick={onMajlis}>اجلسي مع نونة</PrimaryButton>
          <GhostButton onClick={restart}>أعيدي التدريب</GhostButton>
        </div>
      </section>
    );
  }

  if (!question) return null;

  return (
    <section className="space-y-4">
      <Fireworks token={burst} />
      <div className="panel flex items-center gap-3 p-3">
        <img
          key={burst + index}
          src={picked ? (lastRight ? "/noona-happy.jpg" : "/noona-face.jpg") : "/noona-face.jpg"}
          alt="نونة تتابع التدريب"
          className={clsx("h-16 w-16 rounded-full object-cover", picked && lastRight ? "noona-pop" : "noona-float")}
        />
        <p className="text-sm">
          {!picked
            ? "خذي وقتكِ. الحرف الذي بعد النون هو الدليل."
            : lastRight
              ? "أحسنتِ. ثبّتي الحكم ثم كملي."
              : "لا بأس. التصحيح أمامكِ، وهو أهم من الدرجة."}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          سؤال {index + 1} من {quiz.length}
        </span>
        <span>الصواب حتى الآن {correctCount}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-emerald" style={{ width: `${(index / quiz.length) * 100}%` }} />
      </div>
      <QuestionCard question={question} picked={picked} onChoose={choose} />
      {picked ? (
        <div className="flex justify-end">
          <PrimaryButton onClick={next}>{index + 1 === quiz.length ? "النتيجة" : "التالي"}</PrimaryButton>
        </div>
      ) : null}
    </section>
  );
}

function QuestionCard({
  question,
  picked,
  onChoose,
}: {
  question: QuizQuestion;
  picked: string | null;
  onChoose: (id: string) => void;
}) {
  const spot = question.spotId ? spotById(question.spotId) : null;
  const focus = question.focus ?? spot?.focus;
  const right = picked === question.correct;

  return (
    <article className="panel space-y-4 p-5 md:p-6">
      <h2 className="text-2xl text-emerald-deep">{question.prompt}</h2>
      {spot ? (
        <div className="space-y-2">
          <AyahText text={ayahs[spot.ayahKey] ?? ""} focus={focus} />
          <AyahCaption surahName={spot.surahName} ayah={spot.ayah} />
        </div>
      ) : null}
      <div className="grid gap-2">
        {question.choices.map((choice) => {
          const state = !picked ? "idle" : choice.id === question.correct ? "right" : choice.id === picked ? "wrong" : "idle";
          return (
            <button
              key={choice.id}
              type="button"
              disabled={picked !== null}
              onClick={() => onChoose(choice.id)}
              className={clsx(
                "min-h-11 rounded-control border px-4 py-3 text-start font-medium",
                state === "right" && "border-emerald bg-emerald-soft text-emerald-deep",
                state === "wrong" && "border-clay bg-clay-soft text-clay",
                state === "idle" && "border-line bg-paper text-ink hover:bg-gold-soft",
              )}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      {picked ? (
        <div className={clsx("rise rounded-control p-4", right ? "bg-emerald-soft" : "bg-clay-soft")}>
          <p className="font-medium">{right ? "صواب." : "لا بأس. يُصحَّح هكذا."}</p>
          <p className="mt-1">{question.explain}</p>
          {spot ? (
            <div className="mt-3">
              <ListenButton surah={spot.surah} ayah={spot.ayah} label="اسمعي الموضع" />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
