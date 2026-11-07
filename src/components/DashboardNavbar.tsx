'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, User, LogOut, BookOpen, LayoutDashboard, Copy, Check, ArrowUpCircle } from 'lucide-react';

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
        <nav className="bg-[#FFF8FB]/90 backdrop-blur-md shadow-sm p-4 sticky top-0 z-40 border-b border-[rgba(59,49,80,0.14)]">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/" className="lpd-display flex-shrink-0 flex items-center text-[#1E1530]">
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
                        className="flex items-center space-x-2 text-[#3B3150] hover:text-[#D93C78] focus:outline-none min-h-[40px]"
                    >
                        <div className="w-8 h-8 bg-[#FFE9F3] rounded-full flex items-center justify-center overflow-hidden border border-[#FF8AC4]">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-[#D93C78]">{user.name.charAt(0)}</span>
                            )}
                        </div>
                        <span className="hidden md:block font-medium">{user.name}</span>
                        <Menu className="w-5 h-5" />
                    </button>

                    {isOpen && (
                        <div className="lpd-card absolute right-0 mt-2 w-64 py-2 z-50 overflow-hidden">
                            {/* Dashboard Panel */}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#3B3150] hover:text-[#1E1530] transition min-h-[40px]"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-3 text-[#D93C78]" /> Dashboard Panel
                            </Link>

                            {/* My Courses */}
                            <Link
                                href="/dashboard/courses"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#3B3150] hover:text-[#1E1530] transition min-h-[40px]"
                            >
                                <BookOpen className="w-4 h-4 mr-3 text-[#D93C78]" /> My Courses
                            </Link>

                            {/* Upgrade Package */}
                            <Link
                                href="/dashboard/upgrade"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#3B3150] hover:text-[#1E1530] transition min-h-[40px]"
                            >
                                <ArrowUpCircle className="w-4 h-4 mr-3 text-[#D93C78]" /> Upgrade Package
                            </Link>

                            {/* Profile & Bank */}
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#3B3150] hover:text-[#1E1530] transition min-h-[40px]"
                            >
                                <User className="w-4 h-4 mr-3 text-[#D93C78]" /> Profile & Bank
                            </Link>

                            <div className="border-t border-[rgba(59,49,80,0.14)] my-1"></div>

                            {/* Referral Link Copy */}
                            <button
                                onClick={handleCopyReferral}
                                className="w-full flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#3B3150] hover:text-[#1E1530] transition text-left min-h-[40px]"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 mr-3 text-[#0F8E69]" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-3 text-[#D93C78]" />
                                )}
                                <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
                            </button>

                            <div className="border-t border-[rgba(59,49,80,0.14)] my-1"></div>

                            {/* Logout */}
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center px-4 py-3 hover:bg-[#FFE9F3] text-[#FF4F5E] hover:text-[#FF4F5E] transition min-h-[40px]"
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
