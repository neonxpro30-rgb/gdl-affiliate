import Image from 'next/image';
import { Laptop, Wallet, BookOpen, TrendingUp } from 'lucide-react';

export default function WhyUsSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#1A0B12]">Why LearnPeak</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* 1. Trends */}
                    <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                        <div className="w-20 h-20 mx-auto mb-6 relative bg-blue-50 rounded-full flex items-center justify-center text-blue-600 transition-transform active:scale-95 animate-float cursor-pointer">
                            <TrendingUp size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Latest Trends</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Keep yourself updated with the latest market trends in today’s competitive world.
                        </p>
                    </div>

                    {/* 2. Skills */}
                    <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                        <div className="w-20 h-20 mx-auto mb-6 relative bg-purple-50 rounded-full flex items-center justify-center text-purple-600 transition-transform active:scale-95 animate-float cursor-pointer">
                            <Laptop size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Digital Skills</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Learn valuable digital skills that help you grow personally and professionally.
                        </p>
                    </div>

                    {/* 3. Commission */}
                    <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                        <div className="w-20 h-20 mx-auto mb-6 relative bg-green-50 rounded-full flex items-center justify-center text-green-600 transition-transform active:scale-95 animate-float cursor-pointer">
                            <Wallet size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">High Commission</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Join us and earn a decent amount of commission for your professional journey.
                        </p>
                    </div>

                    {/* 4. Resources */}
                    <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                        <div className="w-20 h-20 mx-auto mb-6 relative bg-orange-50 rounded-full flex items-center justify-center text-orange-600 transition-transform active:scale-95 animate-float cursor-pointer">
                            <BookOpen size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Resources & Guidance</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Get access to resources and guidance that help you build a strong and successful digital career.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
