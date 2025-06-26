import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Montserrat, Inria_Serif, Roboto, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fraunces",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-montserrat",
});
const inria_serif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inria-serif",
});

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://deckgenie.ai"),
  title: "DeckGenie.ai - AI Presentation Maker for Data Storytelling",
  description:
    "Turn complex data into stunning, interactive presentations with DeckGenie.ai. Create professional slides from reports and analytics in minutes. Try now!",
  keywords: [
    "AI presentation maker",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
  ],
  openGraph: {
    title: "DeckGenie.ai - AI-Powered Data Presentations",
    description:
      "Transform data into engaging presentations effortlessly with DeckGenie.ai, your go-to AI tool for stunning slides and data storytelling.",
    url: "https://deckgenie.ai",
    siteName: "DeckGenie.ai",
    images: [
      {
        url: "https://deckgenie.ai/deckgenie-feature-graphics.png",
        width: 1200,
        height: 630,
        alt: "DeckGenie.ai Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://deckgenie.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeckGenie.ai - AI Presentation Maker for Data Storytelling",
    description:
      "Create stunning presentations from data with DeckGenie.ai. Simplify reports and analytics into interactive slides fast!",
    images: ["https://deckgenie.ai/deckgenie-feature-graphics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`$ ${inter.variable} ${fraunces.variable} ${montserrat.variable} ${inria_serif.variable} ${roboto.variable} ${instrument_sans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
