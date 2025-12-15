'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, User, LogOut, BookOpen, LayoutDashboard, Copy, Check } from 'lucide-react';

export default function DashboardNavbar({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyReferral = async () => {
        const referralLink = `https://learnpeak.in/signup?ref=${user.referralCode}`;
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for mobile/older browsers if needed, but navigator is standard now
            alert('Failed to copy link');
        }
    };

    return (
        <nav className="bg-[#1A0B12] shadow-sm p-4 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex-shrink-0 flex items-center">
                        <video
                            src="/logo-v2.mp4"
                            poster="/logo-poster.jpg"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 text-[#C57C8A] hover:text-white focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-[#732C3F] rounded-full flex items-center justify-center overflow-hidden border border-[#C57C8A]">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-white">{user.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="hidden md:block font-medium">{user.name}</span>
                        <Menu className="w-5 h-5" />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#1A0B12] rounded-lg shadow-xl border border-[#732C3F] py-2 z-50">
                            {/* Dashboard Panel */}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard Panel
                            </Link>

                            {/* My Courses */}
                            <Link
                                href="/dashboard/courses"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                            >
                                <BookOpen className="w-4 h-4 mr-3" /> My Courses
                            </Link>

                            {/* Profile & Bank */}
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                            >
                                <User className="w-4 h-4 mr-3" /> Profile & Bank
                            </Link>

                            <div className="border-t border-[#732C3F] my-1"></div>

                            {/* Referral Link Copy */}
                            <button
                                onClick={handleCopyReferral}
                                className="w-full flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition text-left"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 mr-3 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-3" />
                                )}
                                <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
                            </button>

                            <div className="border-t border-[#732C3F] my-1"></div>

                            {/* Logout */}
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center px-4 py-3 hover:bg-[#732C3F] text-red-400 hover:text-red-200 transition"
                            >
                                <LogOut className="w-4 h-4 mr-3" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
