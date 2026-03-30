import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans"
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif"
});

export const metadata: Metadata = {
  title: "BriefLoop",
  description: "A memória criativa da sua agência."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans bg-background text-text-primary`}>
        <Header />
        {children}
        <Footer />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "hsl(var(--surface))",
              color: "hsl(var(--text-primary))",
              borderColor: "hsl(var(--border))"
            }
          }}
        />
      </body>
    </html>
  );
}
