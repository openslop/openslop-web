import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-zinc-300">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-violet-400 transition-colors hover:text-violet-300"
        >
          &larr; Back to home
        </Link>

        <h1
          className="mt-8 text-4xl font-bold text-white"
          style={{ fontFamily: "Sentient, serif" }}
        >
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated: February 15, 2026
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 leading-relaxed">
              By accessing or using OpenSlop (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree
              to all of these terms, you may not use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              2. Description of Service
            </h2>
            <p className="mt-2 leading-relaxed">
              OpenSlop provides an AI-powered media generation platform. We
              reserve the right to modify, suspend, or discontinue the Service
              at any time without notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              3. Use License
            </h2>
            <p className="mt-2 leading-relaxed">
              Subject to these Terms, we grant you a limited, non-exclusive,
              non-transferable, revocable license to access and use the Service
              for personal or internal business purposes. You may not:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Modify or copy the Service&apos;s source materials</li>
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable laws
              </li>
              <li>
                Attempt to reverse-engineer or extract the source code of the
                Service
              </li>
              <li>
                Transfer your account or access rights to another party without
                our consent
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              4. User Content
            </h2>
            <p className="mt-2 leading-relaxed">
              You retain ownership of content you create using the Service. By
              using the Service, you grant us a non-exclusive license to process
              your inputs solely for the purpose of delivering the Service to
              you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              5. Limitation of Liability
            </h2>
            <p className="mt-2 leading-relaxed">
              To the fullest extent permitted by law, OpenSlop and its
              affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use
              of the Service. Our total liability shall not exceed the amount
              you paid us in the twelve months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              6. Disclaimer of Warranties
            </h2>
            <p className="mt-2 leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              7. Changes to Terms
            </h2>
            <p className="mt-2 leading-relaxed">
              We may revise these Terms at any time by updating this page. Your
              continued use of the Service after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              8. Contact Us
            </h2>
            <p className="mt-2 leading-relaxed">
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:hi@openslop.ai"
                className="text-violet-400 transition-colors hover:text-violet-300"
              >
                hi@openslop.ai
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
