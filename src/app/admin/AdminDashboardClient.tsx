'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardClient({ referralId, status }: { referralId: string, status: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Legacy commission: marking it paid records that the money was sent.
    const handleMarkPaid = async () => {
        if (!confirm('Mark this commission as PAID? Do this only after you have sent the money.')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralId }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to mark as paid');
            }
        } catch (error) {
            console.error(error);
            alert('Network error — nothing was changed');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'PENDING') {
        return (
            <button
                onClick={handleMarkPaid}
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
                {loading ? 'Saving...' : 'Mark Paid'}
            </button>
        );
    }

    if (status === 'PAID') {
        return <span className="text-green-600 font-bold text-sm">Paid</span>;
    }

    return <span className="text-gray-500 text-sm">Completed</span>;
}
