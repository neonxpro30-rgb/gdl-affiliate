import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | LearnPeak',
    description: 'LearnPeak operates a strict no-refund policy on all digital course purchases. All sales are final.',
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-2">Refund &amp; Cancellation Policy</h1>
                <p className="text-gray-500 mb-8">Last Updated: May 2026</p>

                {/* No Refund Banner */}
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-8 text-center">
                    <p className="text-3xl mb-2">🚫</p>
                    <p className="text-2xl font-extrabold text-red-700">NO REFUND POLICY</p>
                    <p className="text-red-600 mt-2 font-medium">All purchases on LearnPeak are final and non-refundable.</p>
                </div>

                <div className="space-y-8 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">1. Policy Overview</h2>
                        <p>
                            LearnPeak ("Company", "we", "us") sells digital educational courses and packages. Due to the
                            immediate digital delivery nature of our products, <strong>we maintain a strict no-refund,
                            no-cancellation policy on all purchases</strong>.
                        </p>
                        <p className="mt-3">
                            By completing a purchase on learnpeak.in, you explicitly acknowledge and agree that:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>You have reviewed the course/package details before purchasing.</li>
                            <li>You understand this purchase is <strong>non-refundable and non-transferable</strong>.</li>
                            <li>You consent to immediate digital delivery of the product upon payment.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">2. Why No Refunds?</h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="mb-3">
                                Our courses are <strong>100% digital products</strong>. Upon successful payment:
                            </p>
                            <ul className="list-disc ml-6 space-y-2">
                                <li>Your account is immediately activated with course access.</li>
                                <li>Digital content (videos, PDFs, materials) is made available instantly in your dashboard.</li>
                                <li>The product cannot be "returned" or "unused" once access is granted — unlike physical goods.</li>
                            </ul>
                            <p className="mt-3 text-sm text-gray-600">
                                This is standard practice for all digital learning platforms. Our policy complies with applicable
                                Indian consumer protection guidelines for digital/software products.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">3. No Exceptions</h2>
                        <p className="mb-3">Refunds will <strong>NOT</strong> be issued for any of the following reasons:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Change of mind after purchase.</li>
                            <li>Dissatisfaction with course content after accessing it.</li>
                            <li>Accidental purchase (please contact us immediately and we will review on a case-by-case basis, at our sole discretion).</li>
                            <li>Failure to use the platform after purchase.</li>
                            <li>Not achieving expected income or results (there is no income guarantee).</li>
                            <li>Technical issues that have been resolved or are on the user's end.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">4. Chargebacks &amp; Disputes</h2>
                        <div className="bg-orange-50 border border-orange-300 rounded-lg p-5">
                            <p className="mb-3">
                                Filing a chargeback or payment dispute with your bank or payment provider without first
                                contacting LearnPeak is considered a <strong>violation of these Terms</strong> and may result in:
                            </p>
                            <ul className="list-disc ml-6 space-y-2">
                                <li>Immediate suspension of your account and revocation of course access.</li>
                                <li>Permanent ban from the LearnPeak platform.</li>
                                <li>Legal action to recover costs incurred due to the chargeback.</li>
                            </ul>
                            <p className="mt-3 text-sm text-orange-700 font-medium">
                                If you face a genuine issue, please contact us first at{' '}
                                <a href="mailto:learnpeak.in@gmail.com" className="text-[#732C3F] font-bold underline">
                                    learnpeak.in@gmail.com
                                </a>{' '}
                                before raising any dispute.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">5. Technical Failure Exception</h2>
                        <p>
                            In the rare event of a <strong>confirmed technical failure</strong> on our end (e.g., payment
                            successfully debited but account not activated, or duplicate payment charged), we will:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>First attempt to resolve the issue and grant you proper access.</li>
                            <li>If the issue cannot be resolved within 7 working days, we will process a refund for the failed transaction only.</li>
                        </ul>
                        <p className="mt-3 text-sm text-gray-600">
                            This is the ONLY exception. All other sales remain final.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">6. Before You Purchase</h2>
                        <div className="bg-blue-50 border border-blue-300 rounded-xl p-5">
                            <p className="font-semibold text-blue-800 mb-3">We encourage you to:</p>
                            <ul className="list-disc ml-6 space-y-2 text-blue-900">
                                <li>Review the complete course/package description on the homepage.</li>
                                <li>Watch any available free preview content.</li>
                                <li>Read our <Link href="/terms" className="underline font-medium">Terms &amp; Conditions</Link> fully.</li>
                                <li>Contact us with questions BEFORE purchasing: <a href="mailto:learnpeak.in@gmail.com" className="font-bold underline">learnpeak.in@gmail.com</a></li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">7. Contact Us</h2>
                        <p>For any payment-related concerns, please reach out:</p>
                        <div className="mt-3 bg-gray-50 rounded-lg p-4">
                            <p><strong>Email:</strong> <a href="mailto:learnpeak.in@gmail.com" className="text-[#732C3F] font-bold">learnpeak.in@gmail.com</a></p>
                            <p className="mt-1"><strong>Website:</strong> <a href="https://www.learnpeak.in/company/contact" className="text-[#732C3F] font-bold">www.learnpeak.in/company/contact</a></p>
                            <p className="mt-1 text-sm text-gray-500">Response time: Within 2–3 business days.</p>
                        </div>
                    </section>

                    {/* Final Acknowledgement */}
                    <div className="bg-gray-100 rounded-xl p-6 text-center mt-8">
                        <p className="font-bold text-gray-800">
                            By making a purchase on LearnPeak, you confirm that you have read, understood, and unconditionally
                            agree to this No-Refund Policy.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/terms" className="text-[#732C3F] font-medium hover:underline">
                        ← Back to Terms &amp; Conditions
                    </Link>
                </div>
            </div>
        </div>
    );
}
