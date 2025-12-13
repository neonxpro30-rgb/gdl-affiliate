'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentButtons({ orderId, amount, userEmail, userName, productInfo }: { orderId: string, amount: number, userEmail: string, userName: string, productInfo: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePayUPayment = async () => {
        setLoading(true);
        try {
            // 1. Generate Hash
            const res = await fetch('/api/payment/payu-hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txnid: orderId,
                    amount: String(amount), // Ensure string
                    productinfo: productInfo,
                    firstname: userName,
                    email: userEmail,
                    udf1: '', udf2: '', udf3: '', udf4: '', udf5: ''
                }),
            });

            const data = await res.json();
            if (!data.hash) {
                alert('Failed to generate payment hash');
                setLoading(false);
                return;
            }

            // 2. Create Form and Submit
            const payuUrl = 'https://secure.payu.in/_payment';

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuUrl;

            const fields = {
                key: 'bTpGZj',
                txnid: orderId,
                amount: String(amount), // Ensure string match
                productinfo: productInfo,
                firstname: userName,
                email: userEmail,
                phone: '9999999999',
                surl: `${window.location.origin}/api/payment/payu-response`,
                furl: `${window.location.origin}/api/payment/payu-response`,
                hash: data.hash,
                service_provider: 'payu_paisa'
            };

            for (const [key, value] of Object.entries(fields)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error(error);
            alert('Error initiating payment');
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payment/mock-razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const data = await res.json();
            if (data.success) {
                router.push(`/dashboard?payment=success&orderId=${orderId}`);
            } else {
                alert('Mock Payment Failed');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('Error initiating mock payment');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handlePayUPayment}
                disabled={loading}
                className="w-full bg-[#732C3F] text-white py-3 rounded-lg font-bold hover:bg-[#5a2231] transition disabled:opacity-50"
            >
                {loading ? 'Redirecting to PayU...' : `Pay via PayU (₹${amount})`}
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Testing Only</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full bg-[#3395ff] text-white py-3 rounded-lg font-bold hover:bg-[#287acc] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? 'Processing...' : (
                    <>
                        <span>Pay via Razorpay</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">TEST MODE</span>
                    </>
                )}
            </button>
        </div>
    );
}
