import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/passenger", label: "Passenger" },
  { href: "/conductor", label: "Conductor" },
  { href: "/logistics", label: "Logistics" },
  { href: "/admin", label: "Admin" }
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          TransitLink
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 flex w-[92%] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-slate-900/90 px-5 py-3 shadow-glow backdrop-blur md:hidden">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-xs font-medium text-slate-300">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
