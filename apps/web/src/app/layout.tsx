import type { Metadata } from "next";
import "./globals.css";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Siren — Diagrams for React",
  description:
    "High-level diagram components and a free playground, built on React Flow.",
  other: {
    "color-scheme": "dark",
    "theme-color": "#121212",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("dark", outfit.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
