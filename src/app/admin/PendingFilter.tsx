'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: '🕒 Pending' },
    { key: 'claimed', label: '✅ Claimed' },
    { key: 'donated', label: '🌱 Donated' },
];

export default function PendingFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('pendingFilter') || 'all';

    const setFilter = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter === 'all') {
            params.delete('pendingFilter');
        } else {
            params.set('pendingFilter', filter);
        }
        // Keep the tab as pendings
        params.set('tab', 'pendings');
        router.push(`/admin?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 mb-4 flex-wrap">
            {OPTIONS.map((opt) => (
                <button
                    key={opt.key}
                    onClick={() => setFilter(opt.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentFilter === opt.key
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
