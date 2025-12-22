import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions | LearnPeak',
    description: 'Read the terms, conditions, and disclaimers for using LearnPeak platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-2">Terms & Conditions</h1>
                <p className="text-gray-500 mb-8">Last Updated: December 2024</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">

                    {/* Acceptance */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using LearnPeak (www.learnpeak.in), you agree to be bound by these Terms & Conditions.
                            If you do not agree with any part of these terms, please do not use our platform.
                        </p>
                    </section>

                    {/* Platform Description */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">2. Platform Description</h2>
                        <p className="mb-3">
                            LearnPeak is an <strong>educational platform</strong> that provides courses on digital marketing,
                            affiliate marketing, content creation, video editing, and related skills.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-3">
                            <p className="text-yellow-800">
                                <strong>⚠️ Important:</strong> LearnPeak is currently in <strong>Beta/Test Mode</strong>.
                                Features, courses, and functionality may change as we improve the platform.
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                            <p className="text-blue-800">
                                <strong>📚 Courses Status:</strong> Our courses are currently being prepared and will be available soon.
                                Your purchase is secure and you will receive lifetime access once courses are uploaded.
                            </p>
                        </div>
                    </section>

                    {/* Earnings Disclaimer */}
                    <section className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-800 mb-3">3. Earnings Disclaimer ⚠️</h2>
                        <div className="space-y-3 text-red-900">
                            <p><strong>THERE IS NO GUARANTEE OF INCOME OR EARNINGS.</strong></p>
                            <ul className="list-disc ml-6 space-y-2">
                                <li>LearnPeak is an <strong>education platform</strong>, not an income opportunity.</li>
                                <li>Any earnings depend <strong>100% on your individual effort, skills, time invested, and market conditions</strong>.</li>
                                <li>We do NOT promise any specific income, returns, or results.</li>
                                <li>Past results of any user do NOT guarantee your future results.</li>
                                <li>The referral program is a <strong>secondary benefit</strong>, not the primary purpose of the platform.</li>
                                <li>If you are joining ONLY to earn money without learning, this platform is NOT for you.</li>
                            </ul>
                            <p className="font-bold mt-4">
                                By purchasing, you acknowledge that you understand there is NO guaranteed income and
                                your success depends entirely on YOUR effort.
                            </p>
                        </div>
                    </section>

                    {/* Refund Policy */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">4. Refund Policy</h2>
                        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                            <p className="mb-2"><strong>No Refunds After Course Access:</strong></p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li>Once you have accessed any course content, <strong>refunds are not available</strong>.</li>
                                <li>Digital products cannot be "returned" once accessed.</li>
                                <li>Please make an informed decision before purchasing.</li>
                            </ul>
                            <p className="mt-3 text-sm text-orange-700">
                                If you have questions, contact us BEFORE making a purchase.
                            </p>
                        </div>
                    </section>

                    {/* User Responsibilities */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">5. User Responsibilities</h2>
                        <p className="mb-3">As a user, you agree to:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Provide accurate information during registration.</li>
                            <li>Not share your account or course materials with others.</li>
                            <li>Use the platform for learning purposes, not illegal activities.</li>
                            <li>Respect other community members.</li>
                            <li>Not make false claims about income or results when referring others.</li>
                        </ul>
                    </section>

                    {/* Referral Program */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">6. Referral Program Terms</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Referral commissions are earned when someone joins through your referral link and makes a purchase.</li>
                            <li>Commission amounts vary by package and may change without notice.</li>
                            <li>Commissions are paid only after successful verification of the referred user's payment.</li>
                            <li>We reserve the right to withhold commissions in case of suspected fraud or policy violations.</li>
                            <li>The referral program can be modified or discontinued at any time.</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">7. Intellectual Property</h2>
                        <p>
                            All course content, videos, materials, and branding on LearnPeak are owned by us or our licensors.
                            You may not copy, distribute, sell, or share any course materials without written permission.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">8. Limitation of Liability</h2>
                        <p>
                            LearnPeak and its founders are not liable for any direct, indirect, incidental, or consequential
                            damages arising from your use of the platform, including but not limited to loss of income,
                            business opportunities, or any other losses.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Changes will be posted on this page.
                            Continued use of the platform after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">10. Contact Us</h2>
                        <p>
                            For questions about these terms, please contact us at:
                            <br />
                            <strong>Email:</strong> support@learnpeak.in
                            <br />
                            <strong>Website:</strong> www.learnpeak.in/contact
                        </p>
                    </section>

                    {/* Final Agreement */}
                    <div className="bg-gray-100 rounded-xl p-6 text-center mt-8">
                        <p className="font-bold text-gray-800">
                            By using LearnPeak, you confirm that you have read, understood, and agree to these Terms & Conditions.
                        </p>
                    </div>

                </div>

                <div className="mt-8 text-center">
                    <Link href="/company/about" className="text-[#732C3F] font-medium hover:underline">
                        ← Back to About Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
