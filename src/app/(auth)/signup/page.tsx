'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SignupForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        referralCode: '',
        packageId: ''
    });

    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-fill from URL
        const pkgId = searchParams.get('package');
        const refCode = searchParams.get('ref');

        setFormData(prev => ({
            ...prev,
            packageId: pkgId || '',
            referralCode: refCode || ''
        }));

        // Fetch packages for dropdown
        fetch('/api/packages')
            .then(res => res.json())
            .then(data => setPackages(data))
            .catch(err => console.error(err));
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Only allow numbers and max 10 digits
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.phone.length !== 10) {
            setError('Phone number must be exactly 10 digits.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Signup failed');

            // Redirect to payment immediately if order exists
            if (data.orderId) {
                router.push(`/payment/${data.orderId}`);
                return;
            }

            // Auto-login (Only for free tier or if no payment required)
            // Since we are enforcing payment for now, this might not be reached for paid packages
            const { signIn } = await import('next-auth/react');
            const loginRes = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (loginRes?.error) {
                console.error('Auto-login failed:', loginRes.error);
                // Fallback to login page if auto-login fails
                router.push('/login?success=true');
                return;
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#1A0B12]">Create Account</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        name="name" type="text" required
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900"
                        value={formData.name} onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        name="email" type="email" required
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900"
                        value={formData.email} onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        name="phone" type="tel" required
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900"
                        value={formData.phone} onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        name="password" type="password" required
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900"
                        value={formData.password} onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Referral Code (Optional)</label>
                    <input
                        name="referralCode" type="text"
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none bg-gray-50 text-gray-900"
                        value={formData.referralCode} onChange={handleChange}
                        placeholder="Enter code if you have one"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Package</label>
                    <select
                        name="packageId" required
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900"
                        value={formData.packageId} onChange={handleChange}
                    >
                        <option value="">-- Choose a Package --</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - ₹{pkg.price}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-[#732C3F] text-white py-3 rounded-lg font-bold hover:bg-[#5a2231] transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Register & Pay'}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account? <Link href="/login" className="text-[#732C3F] hover:underline font-bold">Login here</Link>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
