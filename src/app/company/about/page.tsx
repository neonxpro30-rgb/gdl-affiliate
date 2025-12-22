import React from 'react';
import Link from 'next/link';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Beta/Test Mode Banner */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-2">🚧</div>
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">Platform in Beta/Test Mode</h2>
                    <p className="text-yellow-700 mb-3">
                        LearnPeak is currently in its early stages. We are continuously improving our courses, features, and user experience based on feedback.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-3 inline-block">
                        <p className="text-yellow-800 font-medium">
                            📚 <strong>Courses Status:</strong> Our courses are currently being prepared and will be available soon.
                            Your purchase is secure and you will get lifetime access once courses are uploaded.
                        </p>
                    </div>
                </div>

                {/* Main About Section */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold text-[#1A0B12] mb-6">About LearnPeak</h1>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg font-medium text-[#732C3F]">
                            Empowering the next generation of digital leaders through skill-based education.
                        </p>

                        <p>
                            LearnPeak is an ed-tech platform designed to help individuals learn practical digital skills like affiliate marketing, content creation, video editing, and social media marketing. Our focus is on <strong>skill development first, earnings second</strong>.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">Our Mission</h2>
                        <p>
                            To provide high-quality, affordable, and practical skills training to students and professionals, enabling them to build real skills that can lead to career growth and financial independence over time.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">Our Vision</h2>
                        <p>
                            To become a trusted platform for digital skill development, creating a community of skilled professionals who succeed through hard work, consistency, and continuous learning.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">What We Offer</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Lifetime Access</strong> to all courses – learn at your own pace.</li>
                            <li>Practical, real-world focused courses.</li>
                            <li>Community support and mentorship.</li>
                            <li>Referral program for additional income (not the primary focus).</li>
                        </ul>
                    </div>
                </div>

                {/* Important Disclaimer Section */}
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
                        ⚠️ Important Disclaimer - Please Read
                    </h2>

                    <div className="space-y-4 text-red-900">
                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">❌ This is NOT a Get-Rich-Quick Scheme</h3>
                            <p>LearnPeak is an education platform. We teach skills. <strong>Earnings are NOT guaranteed</strong> and depend entirely on your effort, skills, and consistency.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">📚 Focus on Learning, Not Just Earning</h3>
                            <p>If you are joining only to "earn money quickly" without learning skills, this platform is <strong>NOT for you</strong>. Success requires months of dedicated learning and practice.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">⏰ Results Take Time</h3>
                            <p>Expect <strong>3-6 months minimum</strong> of consistent effort before seeing any significant results. People who quit after 10-15 days expecting instant money will be disappointed.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">💰 Referral Income is Secondary</h3>
                            <p>Our referral program exists to reward students who recommend others. It should NOT be your primary reason for joining. <strong>Primary focus = Learning Skills.</strong></p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">🎯 Your Success = Your Effort</h3>
                            <p>We provide courses, resources, and community support. But <strong>your success depends 100% on YOU</strong> - your dedication, consistency, and willingness to learn.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">📋 No Refund After Course Access</h3>
                            <p>Once you access the courses, <strong>refunds are not available</strong>. Please understand what you're purchasing before making payment.</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-red-100 rounded-lg text-center">
                        <p className="font-bold text-red-900">
                            By joining LearnPeak, you acknowledge that you have read and understood these terms.
                            <br />If you disagree with any of the above, please do not purchase.
                        </p>
                    </div>
                </div>

                {/* Who Should Join */}
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">✅ LearnPeak is FOR You If:</h2>
                    <ul className="space-y-3 text-green-900">
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You want to <strong>learn real digital skills</strong> (affiliate marketing, content creation, video editing)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You are willing to <strong>put in 3-6 months of consistent effort</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You understand that <strong>success takes time and hard work</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You want to <strong>build a long-term career or side income</strong>, not quick money</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">❌ LearnPeak is NOT For You If:</h2>
                    <ul className="space-y-3 text-red-900">
                        <li className="flex items-start gap-2">
                            <span>✗</span>
                            <span>You expect to <strong>earn money in 10-15 days</strong> without learning</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✗</span>
                            <span>You are <strong>not willing to watch courses and practice</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✗</span>
                            <span>You think this is a <strong>"money circulation" or MLM scheme</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✗</span>
                            <span>You will <strong>blame the platform instead of putting in effort</strong></span>
                        </li>
                    </ul>
                </div>

                {/* Founder Section */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-[#732C3F] mb-6 text-center">Meet Our Founder</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg shrink-0 border-4 border-[#732C3F]">
                            <img
                                src="https://res.cloudinary.com/dhahxfyvo/image/upload/v1764329854/gdl_profiles/user_KgvQCIZGzPW5SpXPknDV.jpg"
                                alt="Naksh Gupta"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900">Naksh Gupta</h3>
                            <p className="text-[#C57C8A] font-medium text-sm mb-3">(Priyanshu Gupta)</p>
                            <p className="text-gray-600 leading-relaxed">
                                Founder of LearnPeak with experience in digital marketing and content creation.
                                His goal is to help individuals develop practical skills for the digital economy.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact & Links */}
                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-4">Have questions before joining?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/contact" className="bg-[#732C3F] text-white px-6 py-2 rounded-full hover:bg-[#5a2231] transition">
                            Contact Us
                        </Link>
                        <Link href="/terms" className="border-2 border-[#732C3F] text-[#732C3F] px-6 py-2 rounded-full hover:bg-[#732C3F] hover:text-white transition">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
