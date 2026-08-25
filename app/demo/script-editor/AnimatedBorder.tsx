const STREAK =
  "conic-gradient(from 0deg, transparent 0%, transparent 65%, rgba(122,121,214,0.7) 73%, rgba(180,179,240,0.9) 77%, rgba(241,234,237,1) 80%, rgba(180,179,240,0.9) 83%, rgba(122,121,214,0.7) 87%, transparent 95%, transparent 100%)";

/** The hero frame: a 1px accent streak orbiting the editor's canvas backdrop. */
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
        <div className="relative z-10 h-full overflow-hidden rounded-2xl bg-editor-bg">
          <div
            aria-hidden
            className="dot-grid-bg pointer-events-none absolute inset-0"
          />
          <div className="relative h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
