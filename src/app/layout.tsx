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
  metadataBase: new URL('https://learnpeak.in'),
  title: {
    default: "LearnPeak - Master Digital Skills & Affiliate Marketing",
    template: "%s | LearnPeak"
  },
  description: "Join LearnPeak to master high-income digital skills, affiliate marketing, and content creation. Start your journey to financial freedom today.",
  keywords: ["affiliate marketing", "digital skills", "online courses", "learnpeak", "financial freedom", "content creation", "video editing", "social media marketing"],
  authors: [{ name: "LearnPeak Team" }],
  creator: "LearnPeak",
  publisher: "LearnPeak",
  openGraph: {
    title: "LearnPeak - Master Digital Skills & Affiliate Marketing",
    description: "Unlock your potential with premium courses in affiliate marketing and digital skills.",
    url: 'https://learnpeak.in',
    siteName: 'LearnPeak',
    images: [
      {
        url: '/logo-poster.jpg', // Using the poster as the social preview image
        width: 1200,
        height: 630,
        alt: 'LearnPeak Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LearnPeak - Master Digital Skills",
    description: "Join LearnPeak to master high-income digital skills and affiliate marketing.",
    images: ['/logo-poster.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

import Providers from "@/components/Providers";

import GlobalNavbar from "@/components/GlobalNavbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <GlobalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
