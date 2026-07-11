/**
 * Dependency-free confetti burst. Spawns short-lived absolutely-positioned
 * petals on <body> that drift and fade with the Web Animations API, then clean
 * themselves up. Used for captures (small) and wins (big).
 */
const PALETTE = [
  "#FF7A59",
  "#F2596F",
  "#F0A13D",
  "#2BB6A3",
  "#8E6BC7",
  "#FFD08A",
];

export function confettiBurst(count = 36, originY = 0.4) {
  if (typeof document === "undefined") return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = w / 2;
  const cy = h * originY;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = 6 + Math.random() * 8;
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
    el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size * 0.6}px;background:${color};border-radius:2px;pointer-events:none;z-index:9999;will-change:transform,opacity;`;
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 320;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (120 + Math.random() * 160);
    const rot = (Math.random() - 0.5) * 720;
    const dur = 900 + Math.random() * 900;

    const anim = el.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 240}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)" },
    );
    anim.onfinish = () => el.remove();
  }
}
