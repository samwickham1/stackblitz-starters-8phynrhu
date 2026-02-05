import Link from "next/link";

const links = [
  { href: "/search", label: "Search" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/pipeline", label: "Pipeline" }
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-mist/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink text-mist grid place-items-center font-semibold">
            SS
          </div>
          <div>
            <div className="text-lg font-semibold">SignalScout</div>
            <div className="text-xs text-slate">Sponsorship Signals Prototype</div>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm uppercase tracking-[0.2em] text-slate">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
