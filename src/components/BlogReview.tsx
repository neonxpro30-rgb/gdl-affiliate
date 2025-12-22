'use client';

import { useState } from 'react';

interface BlogReviewProps {
    slug: string;
}

export default function BlogReview({ slug }: BlogReviewProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [helpful, setHelpful] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/blog/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, rating, feedback, helpful })
            });

            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            alert('Error submitting review');
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200">
                <div className="text-5xl mb-3">🎉</div>
                <h4 className="text-xl font-bold text-green-800 mb-2">Thank You for Your Feedback!</h4>
                <p className="text-green-600">Your review helps us improve our content.</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-1">📝 Was this article helpful?</h3>
            <p className="text-gray-600 mb-6">Your feedback helps us create better content!</p>

            {/* Quick Helpful Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setHelpful(true)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${helpful === true
                        ? 'bg-green-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400'
                        }`}
                >
                    👍 Yes, helpful!
                </button>
                <button
                    onClick={() => setHelpful(false)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${helpful === false
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400'
                        }`}
                >
                    🤔 Could be better
                </button>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate this article:</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="text-4xl transition-transform hover:scale-110"
                            style={{
                                color: star <= (hoveredRating || rating) ? '#FFD700' : '#D1D5DB',
                                textShadow: star <= (hoveredRating || rating) ? '0 0 5px rgba(255,215,0,0.5)' : 'none'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-gray-500 mt-2">You selected {rating} star{rating > 1 ? 's' : ''}</p>
                )}
            </div>

            {/* Optional Feedback */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any suggestions? (Optional)
                </label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-gray-900"
                    placeholder="Tell us how we can improve this article..."
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </div>
    );
}
