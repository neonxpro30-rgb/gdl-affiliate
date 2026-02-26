'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

    const applyFilter = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (startDate) {
            params.set('startDate', startDate);
        } else {
            params.delete('startDate');
        }

        if (endDate) {
            params.set('endDate', endDate);
        } else {
            params.delete('endDate');
        }

        router.push(`/admin?${params.toString()}`);
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('startDate');
        params.delete('endDate');
        router.push(`/admin?${params.toString()}`);
    };

    // Quick filter presets
    const setPreset = (preset: string) => {
        const today = new Date();
        let start = '';
        let end = today.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                start = end;
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                start = yesterday.toISOString().split('T')[0];
                end = start;
                break;
            case 'last7':
                const last7 = new Date(today);
                last7.setDate(last7.getDate() - 7);
                start = last7.toISOString().split('T')[0];
                break;
            case 'last30':
                const last30 = new Date(today);
                last30.setDate(last30.getDate() - 30);
                start = last30.toISOString().split('T')[0];
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'lastMonth':
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                start = lastMonth.toISOString().split('T')[0];
                end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                break;
        }

        setStartDate(start);
        setEndDate(end);

        const params = new URLSearchParams(searchParams.toString());
        params.set('startDate', start);
        params.set('endDate', end);
        router.push(`/admin?${params.toString()}`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">From:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">To:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    onClick={applyFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                    Apply
                </button>

                <button
                    onClick={clearFilter}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                >
                    Clear
                </button>

                <div className="border-l border-gray-300 h-8 mx-2"></div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setPreset('today')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        Today
                    </button>
                    <button onClick={() => setPreset('yesterday')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        Yesterday
                    </button>
                    <button onClick={() => setPreset('last7')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        Last 7 Days
                    </button>
                    <button onClick={() => setPreset('last30')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        Last 30 Days
                    </button>
                    <button onClick={() => setPreset('thisMonth')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        This Month
                    </button>
                    <button onClick={() => setPreset('lastMonth')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition">
                        Last Month
                    </button>
                </div>
            </div>

            {(startDate || endDate) && (
                <div className="mt-3 text-sm text-gray-600">
                    Showing data from <span className="font-medium text-gray-900">{startDate || 'beginning'}</span> to <span className="font-medium text-gray-900">{endDate || 'now'}</span>
                </div>
            )}
        </div>
    );
}
