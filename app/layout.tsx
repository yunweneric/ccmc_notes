import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "sonner";

const urbanist = Urbanist({
  variable: "--font-urbanist",
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
    <html lang="en" suppressHydrationWarning>
      <body
          className={`${urbanist.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
