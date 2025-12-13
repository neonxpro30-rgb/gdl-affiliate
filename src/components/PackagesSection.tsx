import { db } from "@/lib/firebaseAdmin";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import PackageCard from "./PackageCard";

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

    return (
        <section id="packages" className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Our Popular Packages</h2>

            <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                ))}
            </div>
        </section>
    );
}
