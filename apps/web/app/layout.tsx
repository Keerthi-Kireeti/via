import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppShell } from "@transitlink/ui";
import { BottomNav, TopNav } from "../components/navigation";
import { LanguageProvider } from "../lib/i18n";
import "./globals.css";

const font = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Via",
  description: "Real-time bus seat intelligence and parcel logistics for public transport systems."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <LanguageProvider>
          <AppShell>
            <TopNav />
            {children}
            <BottomNav />
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
