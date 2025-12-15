import Link from "next/link";
import Image from "next/image";
import HomeCarousel from "@/components/HomeCarousel";
import HeroSection from "@/components/HeroSection";
import WhyUsSection from "@/components/WhyUsSection";
import PackagesSection from "@/components/PackagesSection";
import TeamSection from "@/components/TeamSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#F7E8EC] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LearnPeak",
            "url": "https://learnpeak.in",
            "logo": "https://learnpeak.in/logo-icon.png",
            "sameAs": [
              "https://instagram.com/learnpeak", // Placeholder - Update if user has specific links
              // Add other social links here
            ],
            "description": "LearnPeak is a premier platform for mastering digital skills and affiliate marketing.",
            "founder": {
              "@type": "Person",
              "name": "Naksh Gupta"
            }
          })
        }}
      />
      {/* Navbar */}
      <nav className="bg-[#1A0B12] shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <video
                src="/logo-v2.mp4"
                poster="/logo-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="h-12 md:h-16 w-auto object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {session ? (
              <Link href="/dashboard" className="flex items-center space-x-2 bg-[#732C3F] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#5a2231] transition">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/20 relative">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A0B12] flex items-center justify-center text-xs font-bold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <span className="text-sm md:text-base font-medium hidden md:block">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm md:text-base text-[#C57C8A] hover:text-white transition">Login</Link>
                <Link href="/signup" className="bg-[#732C3F] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#5a2231] text-sm md:text-base whitespace-nowrap transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 1. Carousel Section */}
      <HomeCarousel />

      {/* 2. Hero Section (Mission/Vision/Demo) */}
      <HeroSection />

      {/* 3. Popular Packages */}
      <PackagesSection />

      {/* 4. Why LearnPeak */}
      <WhyUsSection />

      {/* 5. Meet Our Team */}
      <TeamSection />

      {/* Footer & Disclaimer */}
      {/* Footer & Disclaimer */}
      <footer className="bg-[#1A0B12] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand & Description */}
            <div>
              <div className="mb-6 relative w-48 h-24">
                <Image
                  src="/logo-footer.png"
                  alt="LearnPeak"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get ahead in your career with LearnPeak, the one-stop solution for your educational needs. Connect with top industry professionals and fuel your passion for success. Join now and prepare for the real-world opportunities you've always desired.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white border-b-2 border-[#732C3F] inline-block pb-1">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/legal/privacy-policy" className="hover:text-[#C57C8A] transition">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-[#C57C8A] transition">Terms & Conditions</Link></li>
                <li><Link href="/legal/disclaimer" className="hover:text-[#C57C8A] transition">Disclaimer</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white border-b-2 border-[#732C3F] inline-block pb-1">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/company/about" className="hover:text-[#C57C8A] transition">About</Link></li>
                <li><Link href="/company/contact" className="hover:text-[#C57C8A] transition">Contact</Link></li>
                <li><Link href="/legal/refund-policy" className="hover:text-[#C57C8A] transition">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Column 4: Courses Package */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white border-b-2 border-[#732C3F] inline-block pb-1">Courses Package</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/#packages" className="hover:text-[#C57C8A] transition">Silicon Demo</Link></li>
                <li><Link href="/#packages" className="hover:text-[#C57C8A] transition">Silver Package</Link></li>
                <li><Link href="/#packages" className="hover:text-[#C57C8A] transition">Gold Package</Link></li>
                <li><Link href="/#packages" className="hover:text-[#C57C8A] transition">Diamond Package</Link></li>
              </ul>
            </div>
          </div>

          {/* Disclaimer & Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-400 max-w-4xl mx-auto leading-relaxed mb-4">
              <strong>Disclaimer:</strong> Any payment made outside our official website or authenticated affiliate links is solely at the customer’s risk. LearnPeak holds no responsibility for such transactions.
            </p>
            <p className="text-gray-500 text-sm">&copy; 2024 LearnPeak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
