import React from 'react';
import Link from 'next/link';

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-6">Delivery & Shipping Policy</h1>
                <p className="text-gray-600 mb-4">Last Updated: May 2026</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <p className="font-bold text-blue-800">
                            LearnPeak provides digital educational products and services. No physical products will be shipped.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-[#732C3F]">1. Digital Delivery</h2>
                    <p>
                        As LearnPeak is a digital education platform, all our courses, materials, and resources are delivered electronically. Upon successful completion of your payment, you will receive immediate access to the purchased content through your personalized dashboard.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">2. Instant Access</h2>
                    <p>
                        Access to the courses is generally instantaneous. In rare cases of network or server delays, it might take a few minutes for the courses to reflect in your dashboard. If you face any issues in accessing your purchased content after a successful payment, please contact our support team immediately.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">3. No Physical Shipping</h2>
                    <p>
                        Since our products are 100% digital, there are no physical copies, DVDs, or printed materials shipped to your postal address. Therefore, shipping charges, delivery times, and physical tracking do not apply to any purchases made on LearnPeak.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">4. Account Responsibility</h2>
                    <p>
                        It is your responsibility to provide a valid and accurate email address during registration. All communication regarding your purchase, access details, and account updates will be sent to the registered email address.
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/company/contact" className="text-[#732C3F] font-medium hover:underline">
                        Need Help? Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
