import StaticPageLayout from "@/app/components/StaticPageLayout";

export default function About() {
  return (
    <StaticPageLayout title="About OpenSlop">
      <div>
        <h2 className="text-xl font-semibold text-white">Our Mission</h2>
        <p className="mt-2 leading-relaxed">
          OpenSlop is building an AI-powered media generation platform that
          makes it easy to create high-quality video, music, images, and
          narration from simple text prompts. We believe creative tools should
          be accessible to everyone.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">The Team</h2>
        <p className="mt-2 leading-relaxed">
          We&apos;re a small team of engineers from companies like Meta, Google,
          Stripe, and Dropbox who are passionate about the intersection of AI
          and creativity. We&apos;re building OpenSlop to push the boundaries of
          what&apos;s possible with generative media.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Contact Us</h2>
        <p className="mt-2 leading-relaxed">
          Have questions, feedback, or partnership inquiries? We&apos;d love to
          hear from you.
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <strong className="text-white">Email:</strong>{" "}
            <a
              href="mailto:hi@openslop.ai"
              className="text-violet-400 transition-colors hover:text-violet-300"
            >
              hi@openslop.ai
            </a>
          </li>
        </ul>
      </div>
    </StaticPageLayout>
  );
}
