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
                <p className="text-gray-500 mb-8">Last Updated: February 2026</p>

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
                        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                            <p className="text-green-800">
                                <strong>✅ Active Platform:</strong> LearnPeak is a fully operational digital education platform.
                                All purchased courses are immediately accessible through your personal dashboard upon successful payment.
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
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">4. Refund & Cancellation Policy</h2>
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
                            <p className="font-bold text-red-800 text-lg mb-3">🚫 Strict No-Refund Policy</p>
                            <p className="mb-3 text-red-900">
                                <strong>ALL SALES ARE FINAL.</strong> LearnPeak operates a strict no-refund, no-cancellation policy on all purchases.
                            </p>
                            <ul className="list-disc ml-6 space-y-2 text-red-900">
                                <li>Once a payment is successfully processed, <strong>no refund will be issued under any circumstances</strong>.</li>
                                <li>This policy applies to ALL packages — Silicon, Silver, Gold, and Diamond.</li>
                                <li>Digital course content is delivered immediately upon purchase; hence it cannot be "returned".</li>
                                <li>Requesting a chargeback or payment dispute without contacting us first is a violation of these terms.</li>
                            </ul>
                            <div className="mt-4 bg-red-100 rounded-lg p-3">
                                <p className="text-red-800 text-sm font-medium">
                                    ⚠️ We strongly encourage you to review the course details, watch available previews, and contact us with any questions <strong>BEFORE making a purchase</strong>. Contact: <a href="mailto:learnpeak.in@gmail.com" className="underline">learnpeak.in@gmail.com</a>
                                </p>
                            </div>
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
