import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AURA — Personal AI Stylist",
  description: "Your wardrobe. Reimagined.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-screen flex flex-col items-center">
        <main className="w-full max-w-md md:max-w-2xl min-h-screen relative pb-28">
          {children}
        </main>
      </body>
    </html>
  );
}