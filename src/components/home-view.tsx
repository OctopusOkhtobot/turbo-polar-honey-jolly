import { BookOpen, MessageCircle, PenLine } from "lucide-react";
import { guides, type GuideId } from "@/lib/tajweed/data";
import { Chip, GhostButton, PrimaryButton } from "./ui";

const steps = [
  "افتحي أساس الرواية في هذا المجلس لنصف دقيقة: حفص، والشَّدّ، والغنّة حركتين.",
  "في الشرح اختاري حرفاً من كل حكم، واسمعي الحصري قبل أن تشرحي النطق.",
  "في التدريب قفي عند التصحيح لا عند الدرجة. الخطأ المشهور مادة الدرس.",
  "مع نونة: ابدئي بآية البقرة ٥ ثم قريش. سؤال، ثم الحصري، ثم التكرار.",
];

export function HomeView({
  onOpen,
  onGuide,
}: {
  onOpen: (view: "sharh" | "quiz" | "majlis") => void;
  onGuide: (id: GuideId) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid items-center gap-6 lg:grid-cols-[18rem_1fr]">
        <figure className="panel mx-auto w-full max-w-xs overflow-hidden lg:max-w-none">
          <img
            src="/noona-full.jpg"
            alt="نونة، قطة بشال أخضر بجانب مصحف"
            className="aspect-square w-full object-cover"
          />
        </figure>
        <div className="space-y-4">
          <p className="text-sm font-medium text-gold">مشروع تطبيقي · تعليم التجويد · بنات</p>
          <h1 className="text-4xl text-emerald-deep md:text-5xl">نونة</h1>
          <p className="amiri text-2xl text-ink">مجلس أحكام النون الساكنة والتنوين</p>
          <p className="max-w-2xl text-lg text-ink">
            قطة تجلس أمام الآية، تسأل، وتُسمِع الشيخ الحصري، ثم تطلب التكرار وتصحّح الحكم.
            الشرح مرتّب على تحفة الأطفال، برواية حفص عن عاصم من طريق الشاطبية.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={() => onOpen("majlis")}>
              <MessageCircle className="h-5 w-5" aria-hidden />
              اجلسي مع نونة
            </PrimaryButton>
            <GhostButton onClick={() => onOpen("sharh")}>
              <BookOpen className="h-5 w-5" aria-hidden />
              الشرح
            </GhostButton>
            <GhostButton onClick={() => onOpen("quiz")}>
              <PenLine className="h-5 w-5" aria-hidden />
              التدريب
            </GhostButton>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="panel p-5">
          <h2 className="text-2xl text-emerald-deep">النون الساكنة</h2>
          <p className="mt-2">
            نون أصلية بلا حركة، ثابتة خطاً ولفظاً، وصلاً ووقفاً. تأتي في الاسم والفعل والحرف، وسطاً وطرفاً.
          </p>
        </article>
        <article className="panel p-5">
          <h2 className="text-2xl text-emerald-deep">التنوين</h2>
          <p className="mt-2">
            نون ساكنة زائدة، تلحق آخر الاسم لفظاً لا خطاً، ووصلاً لا وقفاً. علامته فتحتان أو ضمتان أو كسرتان.
            وقفاً يسقط، وتنوين الفتح يصير ألفاً إلا تاء التأنيث.
          </p>
        </article>
      </section>

      <section>
        <h2 className="mb-3 text-2xl text-emerald-deep">الأحكام الأربعة</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {guides.map((guide) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => onGuide(guide.id)}
              className="panel p-5 text-start transition-colors hover:bg-gold-soft"
            >
              <Chip tone={guide.tone}>{guide.name}</Chip>
              <p className="amiri mt-3 text-2xl text-ink">{guide.letters}</p>
              <p className="mt-2 text-sm text-muted">{guide.mnemonic}</p>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          الإظهار المطلق ليس حكماً خامساً. هو استثناء الإدغام في: دنيا، بنيان، قنوان، صنوان.
        </p>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="text-2xl text-emerald-deep">من أيام الدورة</h2>
        <p className="mt-2">
          رُتبت الفكرة في جيمناي، ثم نُقل الشرح الثابت إلى هذا الدرس التفاعلي. ما أُخذ في اليوم الثاني —
          مهارات كلود وربط أوفيس ٣٦٥ وجوجل درايف — خارج هذا الملف، فلا يُعرض على أنه مدمج هنا.
        </p>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="text-2xl text-emerald-deep">عرض في ربع ساعة</h2>
        <ol className="mt-3 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald text-sm text-on-emerald">
                {index + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["الشرح", "حرف حرف، مع علامة المصحف، وعلة الحكم، وخطأ الطالبة الشائع."],
          ["سؤال وجواب", "اثنا عشر سؤالاً. الجواب الخطأ يُفتح عليه التصحيح لا يُكتفى بعلامة."],
          ["مجلس نونة", "الآية مكتوبة، والسؤال من القطة، والتلاوة للحصري، والتكرار ثم إعادة ما سُمع."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-card border border-line bg-emerald-soft p-5">
            <h3 className="text-xl text-emerald-deep">{title}</h3>
            <p className="mt-2 text-sm">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
