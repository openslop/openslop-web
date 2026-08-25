const BACKDROP = `
  radial-gradient(ellipse 90% 70% at 10% 0%, hsl(263, 70%, 22%) 0%, transparent 50%),
  radial-gradient(ellipse 80% 60% at 90% 85%, hsl(240, 60%, 18%) 0%, transparent 45%),
  radial-gradient(ellipse 60% 50% at 65% 25%, hsl(280, 55%, 16%) 0%, transparent 45%),
  radial-gradient(ellipse 50% 40% at 30% 70%, hsl(250, 50%, 14%) 0%, transparent 45%),
  radial-gradient(ellipse 100% 80% at 50% 50%, hsl(230, 60%, 10%) 0%, transparent 75%),
  linear-gradient(160deg, hsl(224, 71%, 6%) 0%, hsl(235, 65%, 12%) 20%, hsl(255, 60%, 16%) 40%,
    hsl(270, 55%, 13%) 60%, hsl(240, 60%, 10%) 80%, hsl(224, 71%, 6%) 100%)`;

const STREAK =
  "conic-gradient(from 0deg, transparent 0%, transparent 65%, rgba(167,139,250,0.7) 73%, rgba(200,180,255,0.9) 77%, rgba(255,255,255,1) 80%, rgba(200,180,255,0.9) 83%, rgba(167,139,250,0.7) 87%, transparent 95%, transparent 100%)";

/** The hero frame: a 1px conic streak orbiting a violet gradient backdrop. */
export default function AnimatedBorder({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full p-3 sm:p-4">
      <div className="relative h-full overflow-hidden rounded-2xl p-px">
        <div
          className="absolute -inset-[200%] animate-[border-spin_6s_linear_infinite] opacity-70 blur-md"
          style={{ background: STREAK }}
        />
        <div
          className="absolute -inset-[200%] animate-[border-spin_6s_linear_infinite]"
          style={{ background: STREAK }}
        />
        <div className="relative z-10 h-full overflow-hidden rounded-2xl">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: BACKDROP }}
          />
          <div className="relative h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
