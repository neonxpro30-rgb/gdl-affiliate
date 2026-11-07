import React from 'react';

export default function Disclaimer() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-6">Disclaimer</h1>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="font-bold text-yellow-800">
                            Important Notice: LearnPeak teaches skills; it is not an income opportunity. LearnPeak is also not responsible for payment made against our products to anyone other than our website or through authenticated affiliate links.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-[#732C3F]">1. Educational Purpose</h2>
                    <p>
                        LearnPeak is a skills school that teaches wedding video editing. The information contained on the LearnPeak website is for general information and education purposes only. The information is provided by LearnPeak and while we endeavour to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">2. No Earnings or Bookings Guarantee</h2>
                    <p>
                        LearnPeak does not guarantee earnings, income, clients, or bookings of any kind. Any earnings or income statements, or any earnings or income examples, are only estimates of what we think you could earn. There is no assurance you will do as well as stated in any examples. If you rely upon any figures provided, you must accept the entire risk of not doing as well as the information provided. What you earn as an editor depends on your skill, effort, portfolio, and market conditions.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">3. Paid Work Opportunities</h2>
                    <p>
                        Top students who complete a course and pass its final test may be considered for paid work on real client wedding projects. These opportunities depend on the quality of the student&apos;s work and on work being available at the time. They are <strong>not guaranteed</strong> to any student, and completing a course does not create an employment relationship with LearnPeak.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">4. Certificate</h2>
                    <p>
                        The certificate issued on completing a course and passing its final test is a <strong>LearnPeak certificate of completion</strong>. It is not a government, university, or board qualification, and it should not be presented as one.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">5. No Professional Advice</h2>
                    <p>
                        The information contained in or made available through our sites (including but not limited to information contained on message boards, in text files, or in chats) cannot replace or substitute for the services of trained professionals in any field, including, but not limited to, financial, medical, psychological, or legal matters.
                    </p>
                </div>
            </div>
        </div>
    );
}
