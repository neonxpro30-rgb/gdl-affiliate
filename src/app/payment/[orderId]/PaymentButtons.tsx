'use client';

import { useState } from 'react';

export default function PaymentButtons({ orderId, amount, userEmail, userName, productInfo }: { orderId: string, amount: number, userEmail: string, userName: string, productInfo: string }) {
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

    return (
        <div className="space-y-4">
            <button
                onClick={handlePayUPayment}
                disabled={loading}
                className="w-full bg-[#732C3F] text-white py-3 rounded-lg font-bold hover:bg-[#5a2231] transition disabled:opacity-50"
            >
                {loading ? 'Redirecting to PayU...' : `Pay Now (₹${amount})`}
            </button>

            <p className="text-center text-xs text-gray-500">
                Secure payment powered by PayU
            </p>
        </div>
    );
}
