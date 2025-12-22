'use client';

import { useState, useEffect } from 'react';

interface Comment {
    id: string;
    name: string;
    content: string;
    createdAt: string;
}

interface BlogCommentsProps {
    slug: string;
}

export default function BlogComments({ slug }: BlogCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', content: '' });

    useEffect(() => {
        fetchComments();
    }, [slug]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/blog/comments?slug=${slug}`);
            const data = await res.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/blog/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, ...formData })
            });

            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setFormData({ name: '', email: '', content: '' });
            } else {
                alert(data.error || 'Failed to submit comment');
            }
        } catch (error) {
            alert('Error submitting comment');
        }
        setSubmitting(false);
    };

    return (
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                💬 Comments ({comments.length})
            </h3>

            {/* Existing Comments */}
            {loading ? (
                <div className="text-gray-500 py-4">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-gray-500 py-4 text-center bg-white rounded-lg p-6">
                    No comments yet. Be the first to share your thoughts! 👇
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#732C3F] to-[#9E4A5F] flex items-center justify-center text-white font-bold">
                                    {comment.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Comment Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-4">Leave a Comment</h4>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-green-600 font-medium">Thank you for your comment!</p>
                        <p className="text-gray-500 text-sm">It will appear after approval.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#732C3F] focus:border-transparent text-gray-900"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#732C3F] focus:border-transparent text-gray-900"
                                    placeholder="your@email.com (not displayed)"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                            <textarea
                                required
                                rows={4}
                                minLength={5}
                                maxLength={1000}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#732C3F] focus:border-transparent resize-none text-gray-900"
                                placeholder="Share your thoughts on this article..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto bg-[#732C3F] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#5a2231] transition disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Post Comment'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
