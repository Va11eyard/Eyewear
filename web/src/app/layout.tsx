import type { Metadata } from "next";
import { IBM_Plex_Mono, Jost, Prata } from "next/font/google";
import "./globals.css";

// Every family here is verified to carry a cyrillic subset. Fraunces, Archivo,
// Cinzel, Marcellus and Italiana were rejected on that evidence rather than on
// taste: without cyrillic a Russian interface silently drops to Georgia.
const display = Prata({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plexmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FRAME оправа по параметрам головы",
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
