'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BankDetailsForm({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        upiId: user.upiId || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/user/bank-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage('Bank details updated successfully!');
                router.refresh();
            } else {
                setMessage('Failed to update details.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error updating details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                        name="bankName" type="text"
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.bankName} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        name="accountNumber" type="text"
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.accountNumber} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <input
                        name="ifscCode" type="text"
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.ifscCode} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input
                        name="upiId" type="text"
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.upiId} onChange={handleChange}
                    />
                </div>
            </div>

            <button
                type="submit" disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Save Details'}
            </button>
        </form>
    );
}
