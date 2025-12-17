import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Linkedin, Facebook } from "lucide-react";

import HomeCarousel from "@/components/HomeCarousel";
import HeroSection from "@/components/HeroSection";
import WhyUsSection from "@/components/WhyUsSection";
import PackagesSection from "@/components/PackagesSection";
import TeamSection from "@/components/TeamSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

import { db } from "@/lib/firebaseAdmin";

async function getPackagesForSchema() {
  try {
    const snapshot = await db.collection('packages').orderBy('price', 'asc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        "@type": "Product",
        "name": data.title,
        "description": data.description || `Master digital skills with the ${data.title} from LearnPeak.`,
        "image": data.image || "https://learnpeak.in/logo-icon.png",
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "url": "https://learnpeak.in/#packages"
        }
      };
    });
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const productSchemas = await getPackagesForSchema();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LearnPeak",
    "url": "https://learnpeak.in",
    "logo": "https://learnpeak.in/logo-icon.png",
    "sameAs": [
      "https://www.instagram.com/learnpeak.in",
      "https://youtube.com/@learnpeak-o8r",
      "https://www.linkedin.com/in/naksh-gupta-b51358394",
      "https://www.facebook.com/share/17pkX8BC3z/"
    ],
    "description": "LearnPeak is a premier platform for mastering digital skills and affiliate marketing.",
    "founder": {
      "@type": "Person",
      "name": "Naksh Gupta"
    }
  };

  return (
    <main className="min-h-screen bg-[#F7E8EC] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, ...productSchemas])
        }}
      />


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
              <div className="mb-6 relative w-48 h-auto aspect-video">
                <Image
                  src="/logo-footer.png"
                  alt="LearnPeak"
                  width={192}
                  height={108}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get ahead in your career with LearnPeak, the one-stop solution for your educational needs. Connect with top industry professionals and fuel your passion for success. Join now and prepare for the real-world opportunities you've always desired.
              </p>

              <div className="flex space-x-4 mt-6">
                <a href="https://www.instagram.com/learnpeak.in?igsh=MW1pYjFxZTV2N21vOA==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C57C8A] transition transform hover:scale-110">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com/@learnpeak-o8r?si=5YRNUnwqJco1fvPy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C57C8A] transition transform hover:scale-110">
                  <Youtube size={20} />
                </a>
                <a href="https://www.linkedin.com/in/naksh-gupta-b51358394?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C57C8A] transition transform hover:scale-110">
                  <Linkedin size={20} />
                </a>
                <a href="https://www.facebook.com/share/17pkX8BC3z/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C57C8A] transition transform hover:scale-110">
                  <Facebook size={20} />
                </a>
              </div>
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
