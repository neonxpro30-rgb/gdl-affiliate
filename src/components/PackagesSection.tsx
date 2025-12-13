import { db } from "@/lib/firebaseAdmin";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

async function getPackages() {
    try {
        const snapshot = await db.collection('packages').orderBy('price', 'asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } catch (error) {
        return [];
    }
}

export default async function PackagesSection() {
    const packages = await getPackages();

    // Separate Silicon Package if it exists, or create a static one for display if needed
    // The user wants specific content for Silicon Package.
    // We will prioritize showing the Silicon Package with the detailed content requested.

    const siliconDetails = [
        { title: "Affiliate Marketing ABCs", desc: "Introduction: What is Affiliate Marketing, how it works, and how money is earned." },
        { title: "Lead Magnet Mastery", desc: "Lead Generation & Traffic: Where to find leads and how to generate instant traffic." },
        { title: "The 'First Money' Sales Script", desc: "Direct Sales Technique: A tested script to sell your first product immediately." },
        { title: "Sales-Ready Social Profile Setup", desc: "Profile Optimization: How to set up a trustworthy social media profile." },
        { title: "Overcome the Fear & Launch", desc: "Mindset: How to overcome fear and take the first action immediately." }
    ];

    return (
        <section id="packages" className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Our Popular Packages</h2>

            <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg) => {
                    const isSilicon = pkg.name.includes('Silicon');
                    const isGold = pkg.name.includes('Gold');
                    const isDiamond = pkg.name.includes('Diamond');

                    return (
                        <div key={pkg.id} className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col ${isGold ? 'border-yellow-400 transform md:-translate-y-4' :
                                isDiamond ? 'border-[#732C3F]' :
                                    isSilicon ? 'border-[#C57C8A]' : 'border-transparent'
                            }`}>
                            <div className={`p-6 text-center text-white ${isGold ? 'bg-yellow-500' :
                                    isDiamond ? 'bg-[#732C3F]' :
                                        isSilicon ? 'bg-[#1A0B12]' : 'bg-gray-500'
                                }`}>
                                <h3 className="text-2xl font-bold">{pkg.name}</h3>
                                <p className="text-4xl font-extrabold mt-2">₹{pkg.price}</p>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                {isSilicon ? (
                                    <div className="space-y-4 mb-8 flex-1">
                                        {siliconDetails.map((detail, idx) => (
                                            <div key={idx} className="text-left">
                                                <h4 className="font-bold text-gray-800 text-sm flex items-center">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                                    {detail.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 ml-6 mt-1">{detail.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mb-8 flex-1">
                                        <p className="text-gray-600 mb-4 italic text-sm">{pkg.description}</p>
                                        <ul className="space-y-3">
                                            {pkg.courses?.map((course: string, idx: number) => (
                                                <li key={idx} className="flex items-start">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">{course}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

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
                })}
            </div>
        </section>
    );
}
