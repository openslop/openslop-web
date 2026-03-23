import dynamic from "next/dynamic";
import AccessCodeLink from "./AccessCodeLink";
import AnimatedTagline from "./AnimatedTagline";
import WaitlistForm from "./WaitlistForm";
import FadeIn from "./FadeIn";

const ScriptEditorDemo = dynamic(
  () => import("@/app/demo/script-editor/ScriptEditorDemo"),
  { ssr: false },
);

export default function HeroSection() {
  return (
    <section className="relative pt-16 pb-2 lg:pt-16 lg:pb-2">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-12 items-center">
        {/* Left column — fixed width */}
        <div className="w-full lg:w-[580px] lg:shrink-0 px-4 sm:px-6 lg:pl-16 space-y-8">
          <FadeIn delay={0.1}>
            <AnimatedTagline />
          </FadeIn>
          <FadeIn delay={0.2}>
            <p
              className="text-lg text-zinc-400 max-w-md"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Connects to all your favorite AI tools and creates consistent,
              engaging content in minutes.{" "}
              <span className="font-bold">Open-source and free forever.</span>
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <WaitlistForm />
            <AccessCodeLink />
          </FadeIn>
        </div>

        {/* Right column — fills remaining width to viewport edge */}
        <FadeIn
          delay={0.6}
          className="w-full lg:flex-1 lg:min-w-0 h-[450px] lg:h-[550px] rounded-2xl lg:rounded-r-none overflow-hidden scrollbar-hide px-4 sm:px-6 lg:px-0"
        >
          <ScriptEditorDemo />
        </FadeIn>
      </div>
    </section>
  );
}
