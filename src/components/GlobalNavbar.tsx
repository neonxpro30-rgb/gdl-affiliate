'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function GlobalNavbar() {
    const pathname = usePathname();

    // Hide Navbar on Dashboard and Admin routes
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
        return null;
    }

    return <Navbar />;
}
