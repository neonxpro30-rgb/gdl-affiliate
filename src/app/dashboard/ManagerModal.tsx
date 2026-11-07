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
        <div className="fixed inset-0 bg-[#1E1530]/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
            <div className="lpd-card lpd-shell w-full max-w-sm overflow-hidden relative animate-fadeIn">
                {/* Header */}
                <div className="lpd-banner p-4 text-center relative border-b border-[rgba(217,60,120,0.22)]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[#6B5F80] hover:text-[#3B3150] min-h-[40px] min-w-[40px] flex items-center justify-center"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="lpd-display text-[#1E1530] text-xl uppercase tracking-wide mt-2">{title}</h2>
                    <p className="text-[#6B5F80] text-sm">Contact for support</p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#FFE9F3] border-2 border-[#FF8AC4] rounded-full flex items-center justify-center mb-4 text-[#D93C78] font-bold text-3xl">
                        {initials}
                    </div>

                    <h3 className="text-xl font-bold text-[#3B3150]">{data.name}</h3>
                    <p className="text-[#6B5F80] font-medium mb-2">{data.phone}</p>
                    {data.email && <p className="text-[#6B5F80] text-sm mb-2">{data.email}</p>}
                    {data.referralCode && <p className="text-[#D93C78] font-mono text-sm font-bold mb-6">ID: {data.referralCode}</p>}

                    {data.whatsappLink && (
                        <a
                            href={data.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lpd-btn lpd-btn-block bg-[#0F8E69] border-[#0F8E69] text-white hover:bg-[#0F8E69]"
                            style={{ background: '#0F8E69', borderColor: '#0F8E69' }}
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
