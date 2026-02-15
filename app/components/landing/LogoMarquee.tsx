import Image from "next/image";

const logos = [
  { name: "Meta", src: "/logos/meta-logo-3.webp" },
  { name: "Google", src: "/logos/google-logo.webp" },
  { name: "Stripe", src: "/logos/stripe-logo.webp" },
  { name: "Dropbox", src: "/logos/dropbox-logo-2.webp" },
];

export default function LogoMarquee() {
  return (
    <section className="border-t border-white/5 py-4 lg:py-4">
      <p className="text-center text-sm text-zinc-500 mb-4">
        From engineers at
      </p>
      <div className="flex items-center justify-center gap-12 sm:gap-16 lg:gap-20">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex shrink-0 items-center opacity-50"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              width={160}
              height={48}
              className="h-8 w-auto"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
