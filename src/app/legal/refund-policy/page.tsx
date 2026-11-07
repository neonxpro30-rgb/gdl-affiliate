import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | LearnPeak',
    description: 'LearnPeak offers a full refund within 24 hours of purchase if less than 20% of the course has been watched.',
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-2">Refund &amp; Cancellation Policy</h1>
                <p className="text-gray-500 mb-8">Last Updated: November 2026</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">1. Our Refund Rule</h2>
                        <p>
                            If a course is not right for you, you can request a <strong>full refund within 24 hours
                            of purchase</strong>, provided you have <strong>watched less than 20% of the course</strong>.
                        </p>
                        <p className="mt-3">
                            Both conditions must be met: the request is made within 24 hours of the purchase, and
                            your watched progress on that course is below 20% at the time of the request. Our system
                            records watched progress automatically, so eligibility is checked from your account data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">2. How to Request a Refund</h2>
                        <p className="mb-3">
                            Refund requests are made through a simple form in your student dashboard. To request:
                        </p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Sign in and open the refund request form in your dashboard.</li>
                            <li>Enter your <strong>order ID</strong>, select the <strong>course</strong>, and give a short <strong>reason</strong> for the request.</li>
                            <li>Submit the form. We will check the purchase time and your watched progress against the rule above.</li>
                        </ul>
                        <p className="mt-3">
                            If you cannot access your dashboard, contact us at{' '}
                            <span className="text-[#732C3F] font-bold">[Support email — to be added]</span>{' '}
                            with the same details (order ID, course, and reason).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">3. What Happens After Approval</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>The full purchase amount is refunded to the <strong>original source of payment</strong> (the same bank account, card, or UPI ID used to pay). The time it takes to appear depends on your bank or payment provider.</li>
                            <li>Access to the refunded course is <strong>removed from your account</strong> once the refund is processed.</li>
                            <li>If the purchase was made through an affiliate&apos;s referral link or coupon code, any affiliate commission earned on that sale is <strong>reversed</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">4. When a Refund Is Not Available</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>More than 24 hours have passed since the purchase.</li>
                            <li>You have watched 20% or more of the course.</li>
                            <li>The request is for a course already refunded once on your account.</li>
                        </ul>
                        <p className="mt-3">
                            Not sure whether you qualify? Try the ₹19 demo lesson first — it shows you exactly how
                            our courses are taught before you commit to a full course.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">5. Failed or Duplicate Payments</h2>
                        <p>
                            If a payment was debited but your course access was not activated, or the same payment
                            was charged twice, please contact us with your order ID. We will either activate your
                            access or refund the failed or duplicate transaction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#732C3F] mb-3">6. Contact Us</h2>
                        <p>For any payment or refund questions, please reach out:</p>
                        <div className="mt-3 bg-gray-50 rounded-lg p-4">
                            <p><strong>Email:</strong> [Support email — to be added]</p>
                            <p className="mt-1"><strong>Address:</strong> [Business address — to be added]</p>
                            <p className="mt-1"><strong>Website:</strong> <a href="https://www.learnpeak.in/company/contact" className="text-[#732C3F] font-bold">www.learnpeak.in/company/contact</a></p>
                            <p className="mt-1 text-sm text-gray-500">Response time: Within 2–3 business days.</p>
                        </div>
                    </section>

                    <div className="bg-gray-100 rounded-xl p-6 text-center mt-8">
                        <p className="font-bold text-gray-800">
                            By making a purchase on LearnPeak, you confirm that you have read and understood this
                            Refund &amp; Cancellation Policy.
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
