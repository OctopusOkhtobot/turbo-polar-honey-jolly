import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

/** A short gold-and-emerald burst. Stays off when the student prefers less motion. */
export function Fireworks({ token }: { token: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!token) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const colors = ["#8a6424", "#c4a15a", "#1e4a3a", "#f4e6c8", "#fffaf3"];
    const sparks: Spark[] = [];

    function burst(cx: number, cy: number) {
      for (let i = 0; i < 36; i += 1) {
        const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.25;
        const speed = (2.1 + Math.random() * 3.2) * dpr;
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[i % colors.length] ?? "#8a6424",
          size: (1.3 + Math.random() * 1.7) * dpr,
        });
      }
    }

    burst(canvas.width * 0.5, canvas.height * 0.26);
    burst(canvas.width * 0.24, canvas.height * 0.34);
    burst(canvas.width * 0.76, canvas.height * 0.32);

    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const spark of sparks) {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.04 * dpr;
        spark.life -= 0.014;
        if (spark.life <= 0) continue;
        ctx.globalAlpha = spark.life;
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (now - started < 1600) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [token]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-30" aria-hidden />;
}
