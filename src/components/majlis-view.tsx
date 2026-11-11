import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { clsx } from "clsx";
import { ayahs } from "@/lib/tajweed/ayahs";
import { arNum } from "@/lib/tajweed/audio";
import { choicesOf, majlis, spotById, type MajlisCard } from "@/lib/tajweed/data";
import { judgeText, phraseScore } from "@/lib/tajweed/judge";
import { playNoona, speakArabic } from "@/lib/noona-voice";
import { AyahText, ListenButton } from "./ayah-text";
import { Fireworks } from "./fireworks";
import { GhostButton, PrimaryButton } from "./ui";

type Role = "noona" | "me";
type Msg = { id: number; role: Role; text: string };
type Phase = "ask" | "coach" | "repeat";

export function MajlisView() {
  const [cardIndex, setCardIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [cued, setCued] = useState(false);
  const [burst, setBurst] = useState(0);
  const [mood, setMood] = useState<"calm" | "glad" | "kind">("calm");
  const opening = majlis[0].steps[0];
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "noona", text: `أنا نونة. الآية أمامكِ، وأنا أسأل. ${opening.ask}` },
  ]);
  const seq = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const lock = useRef(false);
  const card = majlis[cardIndex];
  const step = card.steps[stepIndex];
  const spot = spotById(card.spotId);

  useEffect(() => {
    const w = window as SpeechWindow;
    setMicReady(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.stop();
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, phase]);

  useEffect(() => {
    lock.current = false;
  }, [cardIndex, stepIndex, phase]);

  function say(role: Role, text: string) {
    seq.current += 1;
    setMessages((list) => [...list, { id: seq.current, role, text }]);
  }

  function openCard(nextCard: number, nextStep: number) {
    const item = majlis[nextCard];
    const asking = item.steps[nextStep];
    recRef.current?.stop();
    setListening(false);
    setCardIndex(nextCard);
    setStepIndex(nextStep);
    setPhase("ask");
    setCued(false);
    setDraft("");
    setMood("calm");
    seq.current += 1;
    const hello =
      nextStep === 0
        ? `موضع جديد. ${asking.ask}`
        : asking.ask;
    setMessages([{ id: seq.current, role: "noona", text: hello }]);
  }

  function answer(choiceId: string, label: string) {
    if (phase !== "ask" || lock.current) return;
    lock.current = true;
    say("me", label);
    finishAsk(choiceId === step.correct ? "right" : "wrong");
  }

  function finishAsk(verdict: "right" | "partial" | "wrong") {
    if (verdict === "partial") {
      setMood("kind");
      playNoona("near");
      say("noona", "إدغام، والباب صحيح. أبغنة أم بغير غنة؟ ينمو فيها غنة، واللام والراء عند حفص بلا غنة.");
      lock.current = false;
      return;
    }
    if (verdict === "right") {
      setMood("glad");
      setBurst((value) => value + 1);
      playNoona("praise");
    } else {
      setMood("kind");
      playNoona("gentle");
    }
    say("noona", verdict === "right" ? step.ok : step.no);
    if (stepIndex < card.steps.length - 1) {
      const next = card.steps[stepIndex + 1];
      say("noona", next.ask);
      setStepIndex(stepIndex + 1);
      setPhase("ask");
      return;
    }
    say("noona", "اسمعي الشيخ الحصري، ثم كرري ورائي. أنا أصحّح الحكم، والتلاوة هي مرجع اللفظ.");
    setPhase("coach");
  }

  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (phase !== "ask") {
      judgeRepeat(text);
      return;
    }
    if (lock.current) return;
    lock.current = true;
    say("me", text);
    finishAsk(judgeText(text, step.correct));
  }

  function cueListen() {
    if (cued) return;
    setCued(true);
    say("noona", `${card.listen} كرري الآن: ${card.repeat}`);
    setPhase("repeat");
  }

  function judgeRepeat(text: string) {
    say("me", text);
    const score = phraseScore(text, card.expect);
    if (score >= 0.72) {
      setMood("glad");
      playNoona("heard");
      say("noona", `سمعتُكِ تقولين: «${text}». ${card.heardOk}`);
    } else if (score >= 0.4) {
      setMood("kind");
      playNoona("near");
      say("noona", `اقتربتِ. وصلني: «${text}». أعيدي بعد الحصري: ${card.repeat}`);
    } else {
      setMood("kind");
      playNoona("retry");
      say("noona", `وصلني: «${text}». ${card.heardNo}`);
    }
    setPhase("coach");
  }

  function startMic() {
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      say("noona", "هذا المتصفح لا يفتح الميكروفون، وغالباً يعمل في كروم. اكتبي التكرار في السطر، أو كرري بصوتكِ في الصف بعد الحصري.");
      return;
    }
    recRef.current?.stop();
    const rec = new Ctor();
    rec.lang = "ar-SA";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setListening(false);
      if (text) judgeRepeat(text);
      else say("noona", "لم يصلني صوت واضح. قرّبي الجهاز وكرري الموضع.");
    };
    rec.onerror = () => {
      setListening(false);
      say("noona", "لم يُفتح الميكروفون. اكتبي ما كررتِه، أو أعيدي المحاولة بعد السماح بالصوت.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setPhase("repeat");
    } catch {
      setListening(false);
    }
  }

  function stopMic() {
    recRef.current?.stop();
    setListening(false);
  }

  function speakLast() {
    const last = [...messages].reverse().find((msg) => msg.role === "noona");
    if (!last) return;
    speakArabic(last.text);
  }

  const choices = choicesOf(step.choiceIds);
  const portrait = listening ? "/noona-listen.jpg" : mood === "glad" ? "/noona-happy.jpg" : "/noona-face.jpg";
  const status = listening ? "تصغي إلى تكراركِ" : mood === "glad" ? "فرحة بإجابتكِ" : phase === "ask" ? "تسأل عن الآية" : "تصحّح بهدوء";

  return (
    <div className="space-y-4">
      <Fireworks token={burst} />
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className="panel flex items-center gap-3 p-3 lg:block lg:p-0">
          <img
            key={portrait + mood}
            src={portrait}
            alt={listening ? "نونة تصغي وأمامها كتاب" : mood === "glad" ? "نونة مسرورة" : "وجه نونة"}
            className={clsx(
              "h-20 w-20 rounded-full object-cover lg:h-72 lg:w-full lg:rounded-none",
              mood === "glad" ? "noona-pop" : "noona-float",
            )}
          />
          <div className="lg:p-4">
            <p className="amiri text-3xl text-emerald-deep">نونة</p>
            <p className="text-sm text-muted">{status}</p>
            <p className="mt-2 text-sm">
              الموضع {arNum(cardIndex + 1)} من {arNum(majlis.length)}
            </p>
            <div className="mt-3 flex gap-1">
              {majlis.map((item, index) => (
                <span
                  key={item.id}
                  className={index === cardIndex ? "h-2 w-6 rounded-full bg-emerald" : index < cardIndex ? "h-2 w-2 rounded-full bg-gold" : "h-2 w-2 rounded-full bg-line"}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <article className="panel space-y-3 p-4 md:p-6">
            <p className="text-sm font-medium text-gold">{card.kicker}</p>
            <AyahText text={ayahs[spot.ayahKey] ?? ""} focus={step.focus} />
            <p className="text-sm text-muted">
              سورة {spot.surahName} · الآية {arNum(spot.ayah)}
            </p>
          </article>

          <section className="panel overflow-hidden">
            <div ref={scroller} className="max-h-80 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <p key={msg.id} className={msg.role === "noona" ? "bubble-noona me-8 px-4 py-3" : "bubble-me ms-8 px-4 py-3"}>
                  <span className="mb-1 block text-xs opacity-70">{msg.role === "noona" ? "نونة" : "أنتِ"}</span>
                  {msg.text}
                </p>
              ))}
            </div>
            <div className="space-y-3 border-t border-line p-3">
              {phase === "ask" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {choices.map((choice) => (
                    <GhostButton key={choice.id} onClick={() => answer(choice.id, choice.label)}>
                      {choice.label}
                    </GhostButton>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <ListenButton surah={spot.surah} ayah={spot.ayah} onPlay={cueListen} quiet label="اسمعي الحصري ثم كرري" />
                  {listening ? (
                    <GhostButton onClick={stopMic}>
                      <Square className="h-4 w-4" aria-hidden />
                      إيقاف
                    </GhostButton>
                  ) : (
                    <GhostButton onClick={startMic}>
                      <Mic className="h-4 w-4" aria-hidden />
                      {micReady ? "أكرر ورائها" : "الميكروفون غير متاح"}
                    </GhostButton>
                  )}
                  <GhostButton onClick={speakLast}>
                    <Volume2 className="h-4 w-4" aria-hidden />
                    قراءة الشرح
                  </GhostButton>
                </div>
              )}
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendDraft();
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={phase === "repeat" ? "أو اكتبي ما كررتِه" : "أو اكتبي الحكم"}
                  className="min-h-11 w-full rounded-control border border-line bg-paper px-3 text-ink"
                  aria-label="جوابكِ"
                />
                <PrimaryButton type="submit">إرسال</PrimaryButton>
              </form>
              <div className="flex flex-wrap gap-2">
                {cardIndex > 0 ? (
                  <button type="button" className="min-h-11 px-2 text-sm text-muted" onClick={() => openCard(cardIndex - 1, 0)}>
                    السابق
                  </button>
                ) : null}
                {cardIndex < majlis.length - 1 ? (
                  <button type="button" className="min-h-11 px-2 text-sm text-emerald" onClick={() => openCard(cardIndex + 1, 0)}>
                    الموضع التالي
                  </button>
                ) : (
                  <button type="button" className="min-h-11 px-2 text-sm text-emerald" onClick={() => openCard(0, 0)}>
                    أعيدي المجلس
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      <TeacherNote card={card} />
    </div>
  );
}

function TeacherNote({ card }: { card: MajlisCard }) {
  return (
    <details className="panel p-4">
      <summary className="font-medium text-emerald-deep">ملاحظة للمعلمة في هذا الموضع</summary>
      <p className="mt-2 text-sm">
        التشجيع بصوت نونة الثابت على كل جهاز. قراءة الشرح الطويلة بصوت العربية في المتصفح إن وُجد، وغالباً في كروم.
        الميكروفون يطابق الألفاظ: إتقان من سبعة أعشار، واقتراب من أربعة أعشار، ولا يقيس زمن الغنة.
        المطلوب تكراره هنا: {card.repeat}.
      </p>
    </details>
  );
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRec;
  webkitSpeechRecognition?: new () => SpeechRec;
};
