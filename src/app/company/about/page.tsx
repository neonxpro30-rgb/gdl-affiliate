import React from 'react';
import Link from 'next/link';

export default function AboutUs() {
    const nakshSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Naksh Gupta",
        "alternateName": "Priyanshu Gupta",
        "jobTitle": "Founder",
        "worksFor": {
            "@type": "Organization",
            "name": "LearnPeak"
        },
        "url": "https://learnpeak.in/company/about",
        "image": "https://learnpeak.in/images/founder-naksh.jpg",
        "sameAs": [
            "https://www.linkedin.com/in/naksh-gupta-b51358394",
            "https://www.instagram.com/learnpeak.in"
        ]
    };

    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(nakshSchema) }}
            />
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Active Platform Badge */}
                <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <h2 className="text-xl font-bold text-green-800 mb-2">Active Wedding Video Editing School</h2>
                    <p className="text-green-700 mb-3">
                        LearnPeak is a fully operational school for wedding video editing, taught by a working wedding-film editor. We continuously add new lessons, update content, and improve the learning experience based on student feedback.
                    </p>
                    <div className="bg-green-100 rounded-lg p-3 inline-block">
                        <p className="text-green-800 font-medium">
                            📚 <strong>Course Access:</strong> All courses are available immediately upon purchase through your personal dashboard. You get lifetime access to all course materials.
                        </p>
                    </div>
                </div>

                {/* Main About Section */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold text-[#1A0B12] mb-6">About LearnPeak</h1>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg font-medium text-[#732C3F]">
                            A wedding video editing school, taught by an editor who does this work for real clients.
                        </p>

                        <p>
                            LearnPeak teaches one craft properly: <strong>wedding video editing</strong>. Every course is taught by <strong>Naksh Gupta</strong>, a working wedding-film editor who edits real wedding projects for paying clients. The lessons are built from that real work — real timelines, real footage problems, and the workflow clients actually expect. LearnPeak is a skills school, <strong>not an income opportunity</strong>.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">Our Mission</h2>
                        <p>
                            To teach wedding video editing the way it is actually practised — practically, honestly, and at a price students can afford — so learners build a real, portfolio-ready skill.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">Our Vision</h2>
                        <p>
                            To become a trusted school for wedding-film editing, known for students whose work is good enough to be trusted on real client projects.
                        </p>

                        <h2 className="text-xl font-bold text-[#732C3F]">What We Offer</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Four editing courses</strong> that build step by step, plus a bundle and a ₹19 demo lesson so you can try the teaching style first.</li>
                            <li>Every course ends with a <strong>final test and a LearnPeak certificate of completion</strong>.</li>
                            <li><strong>Paid work on real projects:</strong> top certified students can be offered paid editing work on real client wedding projects. This depends on the quality of their work and is not guaranteed.</li>
                            <li><strong>Premiere Pro extensions</strong> built by Naksh himself — the same tools he uses to speed up his own editing workflow.</li>
                            <li>Learn at your own pace, with course access through your personal dashboard.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-[#732C3F]">Business Details</h2>
                        <p>[Business address — to be added]</p>
                        <p>[Udyam registration — to be added] · [GSTIN — to be added]</p>
                        <p>Support: [Support email — to be added]</p>
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
                            <h3 className="font-bold mb-2">🎬 Paid Work is Earned, Not Promised</h3>
                            <p>Top students who pass the final test may be offered paid work on real client wedding projects. This depends on the quality of your work and is <strong>not guaranteed</strong> to anyone. <strong>Primary focus = Learning the Skill.</strong></p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">🎯 Your Success = Your Effort</h3>
                            <p>We provide courses, resources, and community support. But <strong>your success depends 100% on YOU</strong> - your dedication, consistency, and willingness to learn.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold mb-2">📋 Our Refund Policy</h3>
                            <p>If a course is not right for you, you can get a <strong>full refund within 24 hours of purchase</strong>, provided you have watched less than 20% of the course. See our full <a href="/legal/refund-policy" className="underline font-bold">Refund Policy</a>.</p>
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
                            <span>You want to <strong>learn wedding video editing properly</strong> — the craft, the workflow, and the storytelling</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You are willing to <strong>practice consistently</strong> and finish the course and its final test</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You understand that <strong>skill takes time and hard work</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>You want to <strong>build a real editing portfolio</strong> over time, not quick money</span>
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
                                src="/images/founder-naksh.jpg"
                                alt="Naksh Gupta Founder of LearnPeak"
                                title="Naksh Gupta, Digital Marketing Expert and Founder of LearnPeak"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900">Naksh Gupta</h3>
                            <p className="text-[#C57C8A] font-medium text-sm mb-3">(Priyanshu Gupta)</p>
                            <p className="text-gray-600 leading-relaxed">
                                Founder of LearnPeak and a working wedding-film editor. Naksh edits real
                                wedding projects for clients, teaches every LearnPeak course himself, and
                                builds the Premiere Pro extensions his students use. His goal is simple:
                                teach editing the way it is actually done on real projects.
                            </p>
                        </div>
                    </div>

                    {/* SEO Optimized Photo Gallery */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 aspect-[3/4] relative">
                            <img
                                src="/images/naksh/naksh-gupta-digital-marketing-expert.jpg"
                                alt="Naksh Gupta Digital Marketing Expert India"
                                title="Naksh Gupta - Digital Marketing Expert"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 aspect-[3/4] relative">
                            <img
                                src="/images/naksh/naksh-gupta-founder-learnpeak.jpg"
                                alt="Naksh Gupta Founder of LearnPeak Education Platform"
                                title="Naksh Gupta - Founder of LearnPeak"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 aspect-[3/4] relative">
                            <img
                                src="/images/naksh/naksh-gupta-entrepreneur-india.jpg"
                                alt="Naksh Gupta Young Entrepreneur in India"
                                title="Naksh Gupta - Indian Entrepreneur"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 aspect-[3/4] relative">
                            <img
                                src="/images/naksh/naksh-gupta-affiliate-marketing-coach.jpg"
                                alt="Naksh Gupta Affiliate Marketing Coach and Mentor"
                                title="Naksh Gupta - Affiliate Marketing Coach"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Links */}
                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-4">Have questions before joining?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/company/contact" className="bg-[#732C3F] text-white px-6 py-2 rounded-full hover:bg-[#5a2231] transition">
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
