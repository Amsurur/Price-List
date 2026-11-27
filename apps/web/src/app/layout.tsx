import type { Metadata } from "next";
import { Space_Grotesk, Inter, Manrope } from "next/font/google";
import { PageViewTracker } from "@/components/page-view-tracker";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Space Grotesk has no Cyrillic glyphs; Manrope fills them in for headings.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
});

const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export const metadata: Metadata = {
  title: "Computerra Store",
  description:
    "Computerra: студенты открывают цену со скидкой по личному коду и бронируют компьютерную технику для получения в магазине.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved theme before first paint so dark mode never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PageViewTracker />
      </body>
    </html>
  );
}
