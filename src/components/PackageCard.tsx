"use client";

import Link from "next/link";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PackageCardProps {
    pkg: any;
}

export default function PackageCard({ pkg }: PackageCardProps) {
    const [expanded, setExpanded] = useState(false);

    const isSilicon = pkg.name.includes('Silicon');
    const isGold = pkg.name.includes('Gold');
    const isDiamond = pkg.name.includes('Diamond');
    const isSilver = pkg.name.includes('Silver');

    // Hardcoded details for specific packages to ensure premium display
    const siliconDetails: { title: string; desc: string }[] = [
        { title: "Affiliate Marketing ABCs", desc: "Introduction: What is Affiliate Marketing, how it works, and how money is earned." },
        { title: "Lead Magnet Mastery", desc: "Lead Generation & Traffic: Where to find leads and how to generate instant traffic." },
        { title: "The 'First Money' Sales Script", desc: "Direct Sales Technique: A tested script to sell your first product immediately." },
        { title: "Sales-Ready Social Profile Setup", desc: "Profile Optimization: How to set up a trustworthy social media profile." },
        { title: "Overcome the Fear & Launch", desc: "Mindset: How to overcome fear and take the first action immediately." }
    ];

    const silverDetails: { title: string; desc: string }[] = [
        { title: "Organic Affiliate Marketing Mastery", desc: "Master the art of organic affiliate marketing." },
        { title: "Content Creation Mastery", desc: "Learn how to create compelling content." },
        { title: "Video Creation Mastery Course", desc: "Comprehensive guide to video creation." },
        { title: "Social Media Marketing", desc: "Dominate social media marketing strategies." },
        { title: "Facebook Ads Mastery Course", desc: "Expert level Facebook Ads training." },
        { title: "VN Mobile Editing", desc: "Edit videos like a pro on your mobile with VN." },
        { title: "Instagram Domination", desc: "Grow your Instagram brand and influence." }
    ];

    // Determine content to show
    let displayContent: { title: string; desc: string }[] = [];
    if (isSilicon) displayContent = siliconDetails;
    else if (isSilver) displayContent = silverDetails;

    // For others, use the raw strings from DB if available, or empty
    const rawCourses = pkg.courses || [];

    const visibleItems = expanded ? displayContent : displayContent.slice(0, 3);
    const hasMore = displayContent.length > 3;

    return (
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col ${isGold ? 'border-yellow-400 transform md:-translate-y-4' :
            isDiamond ? 'border-[#732C3F]' :
                isSilicon ? 'border-[#C57C8A]' : 'border-gray-300' // Changed Silver to gray border for better visibility
            }`}>
            <div className={`p-6 text-center text-white ${isGold ? 'bg-yellow-500' :
                isDiamond ? 'bg-[#732C3F]' :
                    isSilicon ? 'bg-[#1A0B12]' : 'bg-gray-600'
                }`}>
                <h3 className="text-2xl font-bold">{pkg.name}</h3>
                <p className="text-4xl font-extrabold mt-2">₹{pkg.price}</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1 mb-8">
                    {/* Render Silicon/Silver with details */}
                    {(isSilicon || isSilver) ? (
                        <div className="space-y-4">
                            {visibleItems.map((detail, idx) => (
                                <div key={idx} className="text-left">
                                    <h4 className="font-bold text-gray-800 text-sm flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{detail.title}</span>
                                    </h4>
                                    <p className="text-xs text-gray-500 ml-6 mt-1">{detail.desc}</p>
                                </div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="text-blue-600 text-sm font-medium flex items-center mt-2 hover:underline ml-6"
                                >
                                    {expanded ? (
                                        <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                                    ) : (
                                        <>Read More <ChevronDown className="w-4 h-4 ml-1" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        // Render standard list for others (Gold, Diamond)
                        <>
                            <p className="text-gray-600 mb-4 italic text-sm">{pkg.description}</p>
                            <ul className="space-y-3">
                                {rawCourses.map((course: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{course}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                <Link
                    href={`/signup?package=${pkg.id}`}
                    className={`block w-full text-center text-white py-3 rounded-lg transition font-semibold mt-auto ${isGold ? 'bg-yellow-600 hover:bg-yellow-700' :
                        isDiamond ? 'bg-purple-800 hover:bg-purple-900' :
                            'bg-gray-900 hover:bg-gray-800'
                        }`}
                >
                    Buy Now
                </Link>
            </div>
        </div>
    );
}
