import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useLanguage } from "../lib/i18n";

export function TopNav() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-white font-bold text-sm sm:text-base">V</div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">TransitLink</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 border-none focus:ring-0 cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="te">TE</option>
            <option value="es">ES</option>
          </select>
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-colors">{t('signin')}</Link>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const { t } = useLanguage();
  const links = [
    { href: "/passenger", label: t('travel'), icon: "👤" },
    { href: "/conductor", label: t('check'), icon: "🎫" },
    { href: "/logistics", label: t('ship'), icon: "📦" },
    { href: "/admin", label: t('admin'), icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 z-50 sm:-translate-x-1/2 px-0 sm:px-4">
      <div className="flex items-center justify-around sm:justify-center gap-1 sm:gap-1 rounded-none sm:rounded-full border-t sm:border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-2 sm:p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center rounded-xl sm:rounded-full px-3 sm:px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-white transition-all duration-200 flex-1 sm:flex-none"
          >
            <span className="text-lg sm:text-xl">{link.icon}</span>
            <span className="mt-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
