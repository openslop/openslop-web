import HeroSection from "./components/landing/HeroSection";
import LogoMarquee from "./components/landing/LogoMarquee";
import AuroraBackground from "./components/landing/AuroraBackground";
import FadeIn from "./components/landing/FadeIn";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <AuroraBackground>
      {/* Logo */}
      <FadeIn
        delay={0}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50"
      >
        <span
          className="text-xl tracking-tight text-white"
          style={{ fontFamily: "Sentient, serif" }}
        >
          OpenSlop
        </span>
      </FadeIn>

      <HeroSection />

      <FadeIn delay={0.5}>
        <LogoMarquee />
      </FadeIn>

      <Footer />
    </AuroraBackground>
  );
}
