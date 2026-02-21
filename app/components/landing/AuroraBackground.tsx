import { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
  showRadialGradient?: boolean;
  animate?: boolean;
}

export default function AuroraBackground({
  children,
  showRadialGradient = true,
  animate = true,
}: AuroraBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        @keyframes aurora-anim {
          from { background-position: 50% 50%, 50% 50%; }
          to { background-position: 350% 50%, 350% 50%; }
        }
        .aurora-layer {
          --dark-gradient: repeating-linear-gradient(
            100deg,
            #0a0a0a 0%,
            #0a0a0a 7%,
            transparent 10%,
            transparent 12%,
            #0a0a0a 16%
          );
          --aurora: repeating-linear-gradient(
            100deg,
            #3b82f6 10%,
            #a5b4fc 15%,
            #93c5fd 20%,
            #ddd6fe 25%,
            #60a5fa 30%
          );
          background-image: var(--dark-gradient), var(--aurora);
          background-size: 300% 200%;
          background-position: 50% 50%;
          filter: blur(10px);
        }
        .aurora-layer::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--dark-gradient), var(--aurora);
          background-size: 200% 100%;
          background-attachment: fixed;
          mix-blend-mode: difference;
          animation: ${animate ? "aurora-anim 60s linear infinite" : "none"};
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="aurora-layer pointer-events-none absolute -inset-[10px] opacity-70 will-change-transform"
          style={
            showRadialGradient
              ? {
                  maskImage:
                    "radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)",
                }
              : undefined
          }
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
