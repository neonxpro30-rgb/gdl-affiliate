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
            {message && <div className={`rounded-[14px] border-2 px-4 py-3 text-sm ${message.includes('success') ? 'border-[#0F8E69]/35 bg-[#E9FBF4] text-[#1E1530]' : 'border-[#FF4F5E]/35 bg-[#FF4F5E]/10 text-[#1E1530]'}`}>{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="lpd-label">Bank Name</label>
                    <input
                        name="bankName" type="text"
                        className="lpd-input"
                        value={formData.bankName} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="lpd-label">Account Number</label>
                    <input
                        name="accountNumber" type="text"
                        className="lpd-input"
                        value={formData.accountNumber} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="lpd-label">IFSC Code</label>
                    <input
                        name="ifscCode" type="text"
                        className="lpd-input"
                        value={formData.ifscCode} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="lpd-label">UPI ID</label>
                    <input
                        name="upiId" type="text"
                        className="lpd-input"
                        value={formData.upiId} onChange={handleChange}
                    />
                </div>
            </div>

            <button
                type="submit" disabled={loading}
                className="lpd-btn lpd-btn-pink"
            >
                {loading ? 'Saving...' : 'Save Details'}
            </button>
        </form>
    );
}
