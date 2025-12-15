import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CCMC Notes – Course Notes Library",
    template: "%s | CCMC Notes",
  },
  description:
    "Browse and read shared course notes by level, semester, and course. Search, filter, and preview PDFs in a clean, responsive interface.",
  keywords: [
    "CCMC Notes",
    "course notes",
    "university notes",
    "lecture notes",
    "PDF notes library",
  ],
  openGraph: {
    title: "CCMC Notes – Course Notes Library",
    description:
      "A central place to browse, search, and read shared course notes across levels and semesters.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CCMC Notes – Course Notes Library",
    description:
      "Browse and read shared course notes with filters, search, and PDF previews.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
