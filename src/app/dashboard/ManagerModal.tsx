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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
            <div className="bg-[#241019] rounded-2xl shadow-[0_0_60px_rgba(115,44,63,0.5)] w-full max-w-sm overflow-hidden relative border border-rose-900/60 animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#732C3F] to-rose-600 p-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="font-display text-white text-xl uppercase tracking-wide mt-2">{title}</h2>
                    <p className="text-rose-100/70 text-sm">Contact for support</p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-rose-950/60 border border-rose-400/30 rounded-full flex items-center justify-center mb-4 text-rose-300 font-bold text-3xl">
                        {initials}
                    </div>

                    <h3 className="text-xl font-bold text-white">{data.name}</h3>
                    <p className="text-rose-100/70 font-medium mb-2">{data.phone}</p>
                    {data.email && <p className="text-rose-100/50 text-sm mb-2">{data.email}</p>}
                    {data.referralCode && <p className="text-rose-300 font-mono text-sm font-bold mb-6">ID: {data.referralCode}</p>}

                    {data.whatsappLink && (
                        <a
                            href={data.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors"
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
