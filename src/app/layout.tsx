import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Hamzury — Learn What Works",
  description: "Hamzury Innovation Hub. Start where you are. We check your level and show you the next step.",
  icons: { icon: "/mark.png" }
};

export const viewport: Viewport = {
  themeColor: "#0a1c30",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
