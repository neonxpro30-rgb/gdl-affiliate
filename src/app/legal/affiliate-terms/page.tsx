import React from 'react';
import Link from 'next/link';

export default function AffiliateTerms() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-2">Affiliate Terms & Promotion Guidelines</h1>
                <p className="text-gray-600 mb-8">Last Updated: October 2026</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        LearnPeak is first and foremost a <strong>skill-education platform</strong>. Our affiliate
                        program is a small referral bonus for students who genuinely recommend our courses —
                        it is <strong>not</strong> an income scheme, investment, or job. By sharing your referral
                        link, you agree to the rules below.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">1. How the Program Works</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You earn a referral bonus only on <strong>direct sales</strong> made through your personal referral link.</li>
                        <li><strong>Single-tier only:</strong> you do not earn anything from sales made by people you referred (no downline, no levels).</li>
                        <li>Your bonus is based on the package <strong>you own</strong> — to earn the full bonus on a higher package, you must own that package yourself.</li>
                        <li>Bonuses are credited only for verified, completed, non-refunded purchases.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">2. Upgrade Bonus (Pending Commission)</h2>
                    <p>
                        If you sell a package that is <strong>higher than the one you own</strong>, you immediately
                        receive the bonus for your own package level. The <strong>difference</strong> between that
                        amount and the full bonus for the sold package is held as an <strong>Upgrade Bonus</strong>
                        in your dashboard.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>7-day claim window:</strong> for 7 days after the sale, you can claim the full Upgrade Bonus by upgrading to the sold package&apos;s level (or higher).</li>
                        <li><strong>After 7 days:</strong> any Upgrade Bonus that was not claimed is <strong>donated to children&apos;s education and food initiatives</strong>. It does not go to the company as income — every donation is recorded in a transparent charity ledger.</li>
                        <li>Claimed bonuses are added to your regular bonus balance and paid out through the normal payout process.</li>
                        <li>You can track every Upgrade Bonus, its exact expiry time, and claim it from your dashboard.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">3. Honest Promotion Rules</h2>
                    <p>When you talk about LearnPeak anywhere — Instagram, YouTube, WhatsApp, calls — you must:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Tell the truth about earnings.</strong> Never post fake, edited, or borrowed income screenshots. Never claim guaranteed income, &ldquo;pakka&rdquo; earnings, or day-one results.</li>
                        <li><strong>Be honest about the source.</strong> If you earned through referrals, don&apos;t claim you earned it &ldquo;by using the skill.&rdquo; Say what actually happened.</li>
                        <li><strong>Disclose your link.</strong> When sharing your referral link, clearly say it&apos;s your referral/affiliate link (e.g. &ldquo;ye mera referral link hai&rdquo;).</li>
                        <li><strong>No hype words.</strong> Don&apos;t call LearnPeak an investment, a job, or a &ldquo;scheme.&rdquo; It&apos;s a skill platform with an optional referral bonus.</li>
                        <li><strong>No spam.</strong> Don&apos;t send unsolicited promotional DMs or messages to strangers.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">4. Prohibited Practices</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Creating fake accounts or fake purchases to generate bonuses for yourself.</li>
                        <li>Running paid ads that impersonate LearnPeak&apos;s official pages or founder.</li>
                        <li>Misleading people about course content, pricing, or refund terms to close a sale.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">5. No Income Guarantee</h2>
                    <p>
                        Referral bonuses are <strong>estimates, not promises</strong>. Whether you earn anything
                        depends entirely on your effort, honesty, and consistency. Most affiliates earn little
                        or nothing. LearnPeak guarantees education — not income.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">6. Violations</h2>
                    <p>
                        Breaking these rules can get you removed from the affiliate program immediately, and
                        any pending bonuses may be cancelled. Serious misuse (fraud, fake proof) may also lead
                        to account termination under our <Link href="/legal/terms" className="text-[#732C3F] font-semibold underline">Terms & Conditions</Link>.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">7. Changes</h2>
                    <p>
                        We may update these guidelines as the program grows. Continued use of your referral
                        link after changes means you accept them.
                    </p>

                    <p className="pt-4 text-sm text-gray-500">
                        Questions about these guidelines? Reach us via the <Link href="/company/contact" className="text-[#732C3F] font-semibold underline">contact page</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
