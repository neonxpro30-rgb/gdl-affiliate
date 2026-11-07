import React from 'react';
import Link from 'next/link';

export default function AffiliateTerms() {
    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-2">Affiliate Terms & Promotion Guidelines</h1>
                <p className="text-gray-600 mb-8">Last Updated: November 2026</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        LearnPeak is first and foremost a <strong>skills school</strong> — we teach wedding video
                        editing. Our affiliate program simply rewards people who genuinely recommend our courses.
                        It is <strong>not</strong> an income scheme, investment, or job, and joining it is
                        completely optional. By sharing your referral link, you agree to the rules below.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">1. Joining the Program</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Free to join:</strong> anyone can become an affiliate. You do <strong>not</strong> need to buy any course or package to join or to earn commission.</li>
                        <li><strong>Single-tier only:</strong> you earn only on <strong>direct sales</strong> made through your personal referral link. You do not earn anything from sales made by people you referred — there is no downline and there are no levels.</li>
                        <li>Commissions are credited only for verified, completed purchases that are not refunded or charged back.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">2. Commission Rates</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Courses: 30% flat</strong> for every affiliate, regardless of what you own or have purchased.</li>
                        <li><strong>Partner tier: 40%</strong> on courses, for verified editors, photographers, and creators. This tier is granted by <strong>manual admin approval</strong> only — it is not automatic and cannot be bought.</li>
                        <li><strong>Premiere Pro extensions: 15–20%</strong>, as configured by admin for each extension.</li>
                        <li><strong>₹19 demo lesson: 0%</strong> — no commission is paid on demo lesson sales.</li>
                        <li>Every affiliate also gets a personal <strong>coupon code</strong> that gives buyers <strong>5–10% off</strong> (the exact discount is configured by admin). Sales made with your coupon code are credited to you the same way as referral-link sales.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">3. How Commissions Are Paid</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Pending:</strong> a commission is recorded as pending as soon as a sale is made through your link or coupon code.</li>
                        <li><strong>Confirmed:</strong> it becomes confirmed <strong>48 hours after the sale</strong>, provided there has been no refund or chargeback on that order.</li>
                        <li><strong>Approved:</strong> confirmed commissions are reviewed and approved for payout.</li>
                        <li><strong>Paid:</strong> approved commissions are paid in <strong>weekly or fortnightly batches</strong>. The minimum payout is <strong>₹500</strong> — balances below ₹500 are carried forward to the next batch.</li>
                        <li><strong>KYC before first payout:</strong> you must submit your PAN and bank account or UPI details before your first payout can be released.</li>
                        <li><strong>TDS:</strong> tax deducted at source (TDS) may be deducted from payouts as per applicable Indian law, at the rate advised by our chartered accountant.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">4. Refunds, Chargebacks and Fraud</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>If a sale is <strong>refunded or charged back</strong>, the commission on that sale is <strong>reversed</strong>, including if it has to be adjusted against a future payout.</li>
                        <li><strong>Self-referral is blocked:</strong> you cannot earn commission on your own purchases, and orders detected as self-referrals earn nothing.</li>
                        <li>If fraud or a policy violation is suspected, an admin may <strong>hold or reject</strong> a commission, and the reason will be recorded.</li>
                        <li>Creating fake accounts or fake purchases to generate commissions is prohibited.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">5. Honest Promotion Rules</h2>
                    <p>When you talk about LearnPeak anywhere — Instagram, YouTube, WhatsApp, calls — you must:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Tell the truth about earnings.</strong> Never post fake, edited, or borrowed income screenshots. Never claim guaranteed income, &ldquo;pakka&rdquo; earnings, or day-one results.</li>
                        <li><strong>Be honest about the source.</strong> If you earned through referrals, don&apos;t claim you earned it &ldquo;by using the skill.&rdquo; Say what actually happened.</li>
                        <li><strong>Disclose your link.</strong> When sharing your referral link, clearly say it&apos;s your referral/affiliate link (e.g. &ldquo;ye mera referral link hai&rdquo;).</li>
                        <li><strong>No hype words.</strong> Don&apos;t call LearnPeak an investment, a job, or a &ldquo;scheme.&rdquo; It&apos;s a skill platform with an optional referral bonus.</li>
                        <li><strong>No spam.</strong> Don&apos;t send unsolicited promotional DMs or messages to strangers.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">6. Prohibited Practices</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Creating fake accounts or fake purchases to generate bonuses for yourself.</li>
                        <li>Running paid ads that impersonate LearnPeak&apos;s official pages or founder.</li>
                        <li>Misleading people about course content, pricing, or refund terms to close a sale.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[#732C3F]">7. No Income Guarantee</h2>
                    <p>
                        Referral commissions are <strong>not promised income</strong>. Whether you earn anything
                        depends entirely on your effort, honesty, and consistency. Most affiliates earn little
                        or nothing. LearnPeak teaches editing skills — it does not guarantee income, work, or bookings.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">8. Violations</h2>
                    <p>
                        Breaking these rules can get you removed from the affiliate program, and any pending
                        commissions may be cancelled. Serious misuse (fraud, fake proof) may also lead to account
                        termination under our <Link href="/legal/terms" className="text-[#732C3F] font-semibold underline">Terms & Conditions</Link>.
                    </p>

                    <h2 className="text-xl font-bold text-[#732C3F]">9. Changes</h2>
                    <p>
                        We may update these terms as the program grows. Continued use of your referral
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
