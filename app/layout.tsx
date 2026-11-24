import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Unicord — One Platform. Every Campus. Endless Connections.",
    template: "%s | Unicord",
  },
  description:
    "Multi-university student network combining academic resources, verified PYQs, Discord-style communities, source-backed opportunities, and an authorized AI campus assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-100">
        {children}
      </body>
    </html>
  );
}
