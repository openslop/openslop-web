import Link from "next/link";

const linkGroups = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Email Us", href: "mailto:hi@openslop.ai" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-zinc-400">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/5 pt-6">
          <span
            className="text-lg tracking-tight text-white"
            style={{ fontFamily: "Sentient, serif" }}
          >
            OpenSlop
          </span>
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} OpenSlop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
