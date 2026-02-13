import HeroSection from "./components/landing/HeroSection";
import LogoMarquee from "./components/landing/LogoMarquee";
import AuroraBackground from "./components/landing/AuroraBackground";

export default function Home() {
  return (
    <AuroraBackground>
      {/* Logo */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50">
        <span
          className="text-xl tracking-tight text-white"
          style={{ fontFamily: "Sentient, serif" }}
        >
          OpenSlop
        </span>
      </div>

      <HeroSection />
      <LogoMarquee />
    </AuroraBackground>
  );
}
