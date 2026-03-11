import Link from "next/link";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated: February 15, 2026
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white">
              1. Information We Collect
            </h2>
            <p className="mt-2 leading-relaxed">
              We may collect the following types of information when you use
              OpenSlop:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                <strong className="text-white">Account information:</strong>{" "}
                name, email address, and other details you provide when signing
                up
              </li>
              <li>
                <strong className="text-white">Usage data:</strong> how you
                interact with the Service, including pages visited, features
                used, and timestamps
              </li>
              <li>
                <strong className="text-white">Device information:</strong>{" "}
                browser type, operating system, IP address, and device
                identifiers
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              2. How We Use Your Information
            </h2>
            <p className="mt-2 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Provide, maintain, and improve the Service</li>
              <li>
                Communicate with you about updates, security alerts, and support
              </li>
              <li>
                Analyze usage patterns to enhance user experience and
                performance
              </li>
              <li>Comply with legal obligations and enforce our Terms</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              3. Data Sharing
            </h2>
            <p className="mt-2 leading-relaxed">
              We do not sell your personal information. We may share data with
              third parties only in the following circumstances:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                With service providers who assist us in operating the Service
              </li>
              <li>When required by law or to protect our legal rights</li>
              <li>
                In connection with a merger, acquisition, or sale of assets
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">4. Cookies</h2>
            <p className="mt-2 leading-relaxed">
              We use cookies and similar technologies to remember your
              preferences, understand how you use the Service, and improve your
              experience. You can control cookie settings through your browser
              preferences.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              5. Data Security
            </h2>
            <p className="mt-2 leading-relaxed">
              We implement reasonable technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              6. Data Retention
            </h2>
            <p className="mt-2 leading-relaxed">
              We retain your personal information for as long as your account is
              active or as needed to provide the Service. You may request
              deletion of your data by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
            <p className="mt-2 leading-relaxed">
              Depending on your location, you may have the right to access,
              correct, delete, or port your personal data. To exercise these
              rights, please contact us at the address below.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              8. Changes to This Policy
            </h2>
            <p className="mt-2 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page with a revised &quot;Last updated&quot; date.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">9. Contact Us</h2>
            <p className="mt-2 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us
              at{" "}
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
