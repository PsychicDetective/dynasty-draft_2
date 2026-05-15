import type { Metadata } from "next";
import "./globals.css";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dynasty Draft — Live Draft Experience",
  description: "Cinematic live dynasty fantasy football draft companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${ibmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
