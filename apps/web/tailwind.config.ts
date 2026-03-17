import { transitlinkTailwindPreset } from "@transitlink/config/tailwind-preset";

/** @type {import("tailwindcss").Config} */
export default {
  presets: [transitlinkTailwindPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
};
