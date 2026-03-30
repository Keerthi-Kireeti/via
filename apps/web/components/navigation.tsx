import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-white font-bold">V</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TransitLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-colors">Sign in</Link>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const links = [
    { href: "/passenger", label: "Passenger", icon: "👤" },
    { href: "/conductor", label: "Conductor", icon: "🎫" },
    { href: "/logistics", label: "Logistics", icon: "📦" },
    { href: "/admin", label: "Admin", icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center rounded-full px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-white transition-all duration-200"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
