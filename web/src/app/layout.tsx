import type { Metadata } from "next";
import { IBM_Plex_Mono, Literata, Manrope } from "next/font/google";
import "./globals.css";

// Cyrillic is not optional here: the whole interface is Russian. Fraunces and
// Archivo were rejected because next/font reports no cyrillic subset for them,
// which would have rendered every headline in the Georgia fallback.
const display = Literata({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-literata",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plexmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FRAME — оправа по параметрам головы",
  description:
    "Живая съёмка, 3D-мерки лица и реальные оптики рядом Без стоковых лиц и выдуманных магазинов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
        >
          К содержанию
        </a>
        {children}
      </body>
    </html>
  );
}
