import type { Config } from "tailwindcss";

export const transitlinkTailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui"]
      },
      backgroundImage: {
        "transit-grid":
          "radial-gradient(circle at center, rgba(34,211,238,0.12) 0, rgba(15,23,42,0) 45%), linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)"
      },
      backgroundSize: {
        "transit-grid": "auto, 56px 56px, 56px 56px"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(15,23,42,0.45)"
      }
    }
  }
};
