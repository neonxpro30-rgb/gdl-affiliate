import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://learnpeak.in'),
  title: {
    default: "LearnPeak – Video Editing, Content Creation & Affiliate Marketing Courses",
    template: "%s | LearnPeak"
  },
  description: "LearnPeak turns learning into a game — master video editing, content creation, personal branding & affiliate marketing across 4 skill levels starting at just ₹19. Lifetime access, beginner-friendly lessons.",
  keywords: ["affiliate marketing", "affiliate marketing course india", "digital skills", "online courses", "learnpeak", "career growth", "content creation", "content creation course", "video editing", "video editing course india", "reels editing course", "social media marketing", "personal branding course", "freelancing course", "online courses hindi", "learn video editing online"],
  authors: [{ name: "LearnPeak Team" }],
  creator: "LearnPeak",
  publisher: "LearnPeak",
  openGraph: {
    title: "LearnPeak – Learn Skills, Level Up",
    description: "Master video editing, content creation & affiliate marketing across 4 game-like skill levels — starting at just ₹19 with lifetime access.",
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
    title: "LearnPeak – Learn Skills, Level Up",
    description: "Master video editing, content creation & affiliate marketing across 4 game-like skill levels — starting at just ₹19 with lifetime access.",
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
  verification: {
    // Site is verified via Google Search Console
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
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}
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
