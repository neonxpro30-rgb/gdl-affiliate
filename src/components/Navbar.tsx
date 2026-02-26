'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, MoreVertical, FileText, Phone, Info } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";

function NavbarContent() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-[#1A0B12] shadow-sm p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <video
                            src="/logo-v2.mp4"
                            poster="/logo-poster.jpg"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-12 md:h-16 w-auto object-contain cursor-pointer"
                        />
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                        {session ? (
                            <Link href="/dashboard" className="flex items-center space-x-2 bg-[#732C3F] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#5a2231] transition">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/20 relative">
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                            sizes="32px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#1A0B12] flex items-center justify-center text-xs font-bold">
                                            {session.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm md:text-base font-medium hidden md:block">Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm md:text-base text-[#C57C8A] hover:text-white transition">Login</Link>
                                <Link href="/signup" className="bg-[#732C3F] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#5a2231] text-sm md:text-base whitespace-nowrap transition">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* 3-Dots Menu (Dropdown) */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 text-white hover:bg-white/10 rounded-full transition"
                        >
                            <MoreVertical size={24} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A0B12] rounded-lg shadow-xl border border-[#732C3F] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    href="/blog"
                                    className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <FileText className="w-4 h-4 mr-3" /> Blog
                                </Link>
                                <Link
                                    href="/company/contact"
                                    className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Phone className="w-4 h-4 mr-3" /> Contact Us
                                </Link>
                                <Link
                                    href="/company/about"
                                    className="flex items-center px-4 py-3 hover:bg-[#732C3F] text-[#C57C8A] hover:text-white transition"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Info className="w-4 h-4 mr-3" /> About Us
                                </Link>
                            </div>
                        )}

                        {/* Click outside to close (simple overlay) */}
                        {menuOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setMenuOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function Navbar() {
    return (
        <SessionProvider>
            <NavbarContent />
        </SessionProvider>
    );
}
