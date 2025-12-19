import React from 'react';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-6">About LearnPeak</h1>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p className="text-lg font-medium text-[#732C3F]">
                        Empowering the next generation of digital leaders.
                    </p>

                    <p>
                        LearnPeak is a premier ed-tech platform designed to bridge the gap between traditional education and the skills required in the modern digital economy. We believe that quality education should be accessible, practical, and career-oriented.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">Our Mission</h2>
                    <p>
                        To provide high-quality, affordable, and practical skills training to millions of students and professionals, enabling them to achieve financial independence and career growth.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">Our Vision</h2>
                    <p>
                        To become the leading platform for digital skill development and affiliate marketing, creating a community of successful entrepreneurs and skilled professionals.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">Why Choose Us?</h2>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Lifetime Access</strong> to all courses – learn at your own pace, forever.</li>
                        <li>Expert-led courses designed for real-world application.</li>
                        <li>Comprehensive support and mentorship.</li>
                        <li>A thriving community of learners and achievers.</li>
                        <li>Proven track record of success.</li>
                    </ul>

                    <div className="mt-12 border-t border-gray-200 pt-8">
                        <h2 className="text-2xl font-bold text-[#732C3F] mb-6 text-center">Meet Our Founder</h2>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg shrink-0 border-4 border-[#732C3F] relative">
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
                                    A visionary leader and the driving force behind LearnPeak. With extensive experience as a
                                    <span className="font-semibold text-[#732C3F]"> Lead Editor in a premier photography team</span> and a proven track record as a
                                    <span className="font-semibold text-[#732C3F]"> Digital Marketing Expert</span>, Naksh brings a unique blend of creative artistry and strategic marketing insight.
                                    His passion for empowering individuals with practical digital skills has inspired the creation of this platform, helping thousands bridge the gap between ambition and achievement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
