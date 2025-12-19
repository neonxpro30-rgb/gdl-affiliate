'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CommissionFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('commissionFilter') || 'all';

    const setFilter = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter === 'all') {
            params.delete('commissionFilter');
        } else {
            params.set('commissionFilter', filter);
        }
        // Keep the tab as commissions
        params.set('tab', 'commissions');
        router.push(`/admin?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentFilter === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                All
            </button>
            <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentFilter === 'pending'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                    }`}
            >
                🕒 Pending
            </button>
            <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentFilter === 'paid'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
            >
                ✅ Confirmed
            </button>
        </div>
    );
}
