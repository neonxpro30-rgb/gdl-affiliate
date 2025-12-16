'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { User } from 'lucide-react';
import DashboardNavbar from "@/components/DashboardNavbar";
import ManagerModal from "./ManagerModal";
import CountUp from "@/components/CountUp";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState({
        today: 0,
        sevenDays: 0,
        thirtyDays: 0,
        allTime: 0,
        pending: 0,
        paid: 0
    });
    const [packageName, setPackageName] = useState('Loading...');
    const [mentor, setMentor] = useState({ name: 'Loading...', phone: '', email: '', referralCode: '' });

    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }

        async function fetchUserProfile() {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }

        async function fetchStats() {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        async function fetchPackage() {
            try {
                const res = await fetch('/api/user/package');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.name) setPackageName(data.name);
                }
            } catch (error) {
                console.error("Error fetching package:", error);
                setPackageName('Standard Package');
            }
        }

        async function fetchMentor() {
            try {
                const res = await fetch('/api/user/mentor');
                if (res.ok) {
                    const data = await res.json();
                    setMentor(data);
                }
            } catch (error) {
                console.error("Error fetching mentor:", error);
                setMentor({ name: 'Prakhar Mishra', phone: '+91 9554819859', email: 'learnpeak.in@gmail.com', referralCode: 'ADMIN' });
            }
        }

        if (session) {
            fetchUserProfile();
            fetchStats();
            fetchPackage();
            fetchMentor();
        }
    }, [session, status]);

    useEffect(() => {
        // Check for payment success param and orderId
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const orderId = params.get('orderId');

        if (paymentStatus === 'success' && orderId) {
            // Call verify API
            fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    paymentId: 'VERIFY_' + Date.now() // Optional
                })
            }).then(res => {
                if (res.ok) {
                    // Refresh stats
                    // Clean URL
                    window.history.replaceState({}, '', '/dashboard');
                    window.location.reload();
                }
            });
        }
    }, []);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        data: { name: '', phone: '', email: '', referralCode: '', whatsappLink: '' }
    });

    const openManagerModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Manager Details',
            data: {
                name: 'Prakhar Mishra',
                phone: '+91 93692 10597',
                email: 'learnpeak.in@gmail.com',
                referralCode: 'MANAGER',
                whatsappLink: 'https://chat.whatsapp.com/KEDtQP9L7hLJqmnHsBmqvg'
            }
        });
    };

    const openMentorModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Mentor Details',
            data: { ...mentor, whatsappLink: '' }
        });
    };

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) return null;

    // Use userProfile if available, otherwise fallback to session.user
    const displayUser = userProfile || session.user;

    return (
        <div className="min-h-screen bg-[#FFFBF0]"> {/* Creamy background */}
            <DashboardNavbar user={displayUser} />

            <div className="max-w-md md:max-w-7xl mx-auto p-4 pb-24">

                {/* 1. Purple Gradient Header Card */}
                <div className="bg-gradient-to-br from-[#B28DFF] to-[#D8B4FE] rounded-[2rem] p-6 mb-8 shadow-lg relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/50 overflow-hidden">
                            {displayUser.photoURL ? (
                                <img src={displayUser.photoURL} alt={displayUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-white md:w-12 md:h-12" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">{displayUser.name}</h1>
                            <p className="text-white/90 font-medium text-lg md:text-xl">{packageName}</p>
                            <div className="mt-2 inline-flex items-center bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                                <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wide mr-2">Unique ID:</span>
                                <span className="font-mono text-sm md:text-base font-bold text-white">{displayUser.referralCode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Action Buttons */}
                <div className="flex flex-row justify-between gap-3 mb-8">
                    <button
                        onClick={openMentorModal}
                        className="bg-[#2D0A31] text-white px-2 py-3 rounded-xl flex-1 text-center shadow-md flex items-center justify-center font-medium text-xs md:text-base hover:bg-[#3d0e42] transition-all transform hover:scale-[1.02]"
                    >
                        View Mentor Details
                    </button>

                    <button
                        onClick={openManagerModal}
                        className="bg-[#2D0A31] text-white px-2 py-3 rounded-xl flex-1 text-center shadow-md flex items-center justify-center font-medium text-xs md:text-base hover:bg-[#3d0e42] transition-all transform hover:scale-[1.02]"
                    >
                        View Manager Details
                    </button>
                </div>

                {/* 3. Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Today's Earning */}
                    <div className="bg-[#E6D4FF] rounded-xl p-5 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-900 font-serif text-lg">Today's Earning</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            <CountUp end={stats.today} prefix="₹ " />
                        </p>
                    </div>

                    {/* Last 7 Days */}
                    <div className="bg-[#E6D4FF] rounded-xl p-5 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-900 font-serif text-lg">Last 7 Days Earning</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            <CountUp end={stats.sevenDays} prefix="₹ " />
                        </p>
                    </div>

                    {/* Last 30 Days */}
                    <div className="bg-[#E6D4FF] rounded-xl p-5 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-900 font-serif text-lg">Last 30 Days Earning</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            <CountUp end={stats.thirtyDays} prefix="₹ " />
                        </p>
                    </div>

                    {/* All Time Earning */}
                    <div className="bg-[#E6D4FF] rounded-xl p-5 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-900 font-serif text-lg">All Time Earning</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            <CountUp end={stats.allTime} prefix="₹ " />
                        </p>
                    </div>
                </div>

                {/* 4. Payment Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mt-8">
                    <div className="bg-[#D9D9D9] rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-gray-800 font-medium text-sm md:text-base mb-2">Pending Amount</h3>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">
                            <CountUp end={stats.pending} prefix="₹ " />
                        </p>
                    </div>

                    <div className="bg-[#C1E1C1] rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-gray-800 font-medium text-sm md:text-base mb-2">Transferred Amount</h3>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">
                            <CountUp end={stats.paid} prefix="₹ " />
                        </p>
                    </div>
                </div>

            </div>

            <ManagerModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                data={modalConfig.data}
            />
        </div>
    );
}
