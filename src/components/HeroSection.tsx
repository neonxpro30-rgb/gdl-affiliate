'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
    const scrollToPackages = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById('packages');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <div className="text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A0B12] mb-6 leading-tight">
                        Empowering Education, <br />
                        <span className="text-[#732C3F]">Transforming Lives</span>
                    </h1>
                    <p className="text-lg text-gray-700 mb-8 max-w-lg">
                        Join thousands of students learning high-income skills. Choose a package and start your journey to financial freedom.
                        <br />
                        <span className="font-bold text-[#732C3F] mt-2 block">Earn 80% Commission and Passive Income!</span>
                    </p>
                    <div className="flex gap-4">
                        <Link href="/signup" className="bg-[#732C3F] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#5a2231] transition shadow-lg hover:shadow-xl">
                            Get Started
                        </Link>
                        <button
                            onClick={scrollToPackages}
                            className="bg-transparent text-[#732C3F] border-2 border-[#732C3F] px-8 py-3 rounded-full font-bold text-lg hover:bg-[#F7E8EC] transition cursor-pointer"
                        >
                            View Packages
                        </button>
                    </div>
                </div>

                {/* Right: Icon Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Mission */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <Image src="/images/icon-mission.png" alt="Mission" fill className="object-contain" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Mission</h3>
                        <p className="text-xs text-gray-500">Empowering education, transforming lives</p>
                    </div>

                    {/* Vision */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <Image src="/images/icon-vision.png" alt="Vision" fill className="object-contain" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Vision</h3>
                        <p className="text-xs text-gray-500">Innovative learning for success</p>
                    </div>

                    {/* Demo */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <Image src="/images/icon-demo.png" alt="Demo" fill className="object-contain" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Demo</h3>
                        <p className="text-xs text-gray-500">Experience excellence with our demo</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
