import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ayahs } from "@/lib/tajweed/ayahs";
import { guides, ruleLabel, spotsForGuide, toneForRule, type GuideId } from "@/lib/tajweed/data";
import { AyahCaption, AyahText, ListenButton } from "./ayah-text";
import { Chip } from "./ui";

export function SharhView({ guideId, onGuide }: { guideId: GuideId; onGuide: (id: GuideId) => void }) {
  const guide = guides.find((item) => item.id === guideId) ?? guides[0];
  const list = spotsForGuide(guide.id);
  const [spotId, setSpotId] = useState(list[0]?.id ?? "");

  useEffect(() => {
    const next = spotsForGuide(guideId)[0];
    if (next) setSpotId(next.id);
  }, [guideId]);

  const spot = list.find((item) => item.id === spotId) ?? list[0];
  if (!spot) return null;

  return (
    <div className="space-y-5">
      <aside className="panel flex items-center gap-3 p-3">
        <img src="/noona-face.jpg" alt="نونة" className="noona-float h-16 w-16 rounded-full object-cover" />
        <p className="text-sm">اختاري الحرف، ثم اسمعي الحصري قبل أن تحكمي. النطق يُضبط بالأذن لا بالتخمين.</p>
      </aside>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {guides.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onGuide(item.id)}
            className={clsx(
              "min-h-11 shrink-0 rounded-control px-4 py-2 font-medium",
              item.id === guide.id ? "bg-emerald text-on-emerald" : "border border-line bg-paper text-ink",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <section className="panel space-y-4 p-5 md:p-6">
        <Chip tone={guide.tone}>{guide.name}</Chip>
        <p className="text-lg">{guide.one}</p>
        <p className="amiri text-3xl text-emerald-deep">{guide.letters}</p>
        <p className="text-sm text-gold">{guide.mnemonic}</p>
        <dl className="grid gap-3 md:grid-cols-3">
          {[
            ["العلة", guide.cause],
            ["الغنة", guide.ghunnah],
            ["علامة المصحف", guide.mushaf],
          ].map(([term, body]) => (
            <div key={term} className="rounded-control bg-parchment p-3">
              <dt className="text-sm font-medium text-emerald">{term}</dt>
              <dd className="mt-1 text-sm">{body}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-2 text-sm">
          {guide.notes.map((note) => (
            <li key={note} className="border-s-2 border-gold ps-3">
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl text-emerald-deep">الحروف والأمثلة</h2>
        <div className="flex flex-wrap gap-2">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSpotId(item.id)}
              className={clsx(
                "min-h-11 min-w-16 rounded-control px-3 py-2",
                item.id === spot.id ? "bg-emerald text-on-emerald" : "border border-line bg-paper text-ink",
              )}
            >
              <span className="amiri block text-2xl leading-none">{item.glyph}</span>
              <span className="text-xs">{item.place.startsWith("كلمة") ? "كلمة" : item.place.startsWith("تنوين") ? "تنوين" : "كلمتان"}</span>
            </button>
          ))}
        </div>

        <article className="panel space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={toneForRule(spot.rule)}>{ruleLabel(spot.rule)}</Chip>
            <span className="text-sm text-muted">
              {spot.letter} · {spot.place}
            </span>
          </div>
          <AyahText text={ayahs[spot.ayahKey] ?? ""} focus={spot.focus} />
          <AyahCaption surahName={spot.surahName} ayah={spot.ayah} />
          <ListenButton surah={spot.surah} ayah={spot.ayah} />
          <div className="grid gap-3 md:grid-cols-2">
            <Info title="لماذا" body={spot.why} />
            <Info title="كيف يُنطق" body={spot.how} />
            <Info title="الغنة" body={spot.rank ? `${spot.ghunnah} · ${spot.rank}` : spot.ghunnah} />
            <Info title="الخطأ الشائع" body={spot.mistake} />
          </div>
        </article>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="text-2xl text-emerald-deep">من التحفة</h2>
        <p className="amiri mt-3 whitespace-pre-line text-xl leading-loose text-ink">{guide.poem}</p>
        <h3 className="mt-4 text-lg text-clay">ما يُصحَّح في الصف</h3>
        <ul className="mt-2 space-y-2">
          {guide.pitfalls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-control bg-parchment p-3">
      <p className="text-sm font-medium text-emerald">{title}</p>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}
