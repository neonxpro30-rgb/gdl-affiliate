'use client';

import { X, MessageCircle } from 'lucide-react';

interface ManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: {
        name: string;
        phone: string;
        email?: string;
        referralCode?: string;
        whatsappLink?: string;
    };
}

export default function ManagerModal({ isOpen, onClose, title, data }: ManagerModalProps) {
    if (!isOpen) return null;

    const initials = data.name
        ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : '??';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative animate-fadeIn">
                {/* Header */}
                <div className="bg-purple-600 p-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-white text-xl font-bold mt-2">{title}</h2>
                    <p className="text-purple-100 text-sm">Contact for support</p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600 font-bold text-3xl">
                        {initials}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
                    <p className="text-gray-500 font-medium mb-2">{data.phone}</p>
                    {data.email && <p className="text-gray-400 text-sm mb-2">{data.email}</p>}
                    {data.referralCode && <p className="text-purple-600 font-mono text-sm font-bold mb-6">ID: {data.referralCode}</p>}

                    {data.whatsappLink && (
                        <a
                            href={data.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                        >
                            <MessageCircle size={20} />
                            Join WhatsApp Group
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
