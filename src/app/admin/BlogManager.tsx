'use client';

import { useState, useEffect } from 'react';

export default function BlogManager() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '', image: '', published: false });
    const [loading, setLoading] = useState(false);

    // AI Generation states
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
    const [showAiPanel, setShowAiPanel] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/admin/posts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts');
        }
    };

    const fetchTopicSuggestions = async () => {
        try {
            const res = await fetch('/api/admin/ai-blog');
            const data = await res.json();
            if (data.success && data.topics) {
                setTopicSuggestions(data.topics);
            }
        } catch (error) {
            console.error('Failed to fetch topic suggestions');
        }
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/ai-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: aiTopic || undefined,
                    autoSave: false // Don't auto-save, let user review first
                })
            });

            const data = await res.json();

            if (data.success && data.blog) {
                // Fill form with generated content
                setFormData({
                    title: data.blog.title,
                    content: data.blog.content,
                    image: data.blog.imageUrl || '',
                    published: false
                });
                setIsEditing(true);
                setShowAiPanel(false);
                setAiTopic('');
                alert('✅ Blog generated! Review and edit before publishing.');
            } else {
                alert('❌ ' + (data.error || 'Failed to generate blog'));
            }
        } catch (error) {
            alert('❌ Error generating blog');
            console.error(error);
        }
        setIsGenerating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = currentPost ? `/api/admin/posts/${currentPost.id}` : '/api/admin/posts';
        const method = currentPost ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setIsEditing(false);
            setCurrentPost(null);
            setFormData({ title: '', content: '', image: '', published: false });
            fetchPosts();
        }
        setLoading(false);
    };

    const handleEdit = (post: any) => {
        setCurrentPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            image: post.image || '',
            published: post.published
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
        fetchPosts();
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Manage Blog Posts</h2>
                <div className="flex gap-2">
                    {!isEditing && !showAiPanel && (
                        <>
                            <button
                                onClick={() => {
                                    setShowAiPanel(true);
                                    fetchTopicSuggestions();
                                }}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
                            >
                                <span>🤖</span> Generate with AI
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#732C3F] text-white px-4 py-2 rounded-lg hover:bg-[#5a2231]"
                            >
                                Create Manual Post
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* AI Generation Panel */}
            {showAiPanel && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🤖</span> AI Blog Generator
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter topic (or leave empty for AI to choose):
                            </label>
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g., How to start affiliate marketing in India"
                                className="w-full p-3 border rounded-lg text-gray-900"
                            />
                        </div>

                        {topicSuggestions.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600 mb-2">💡 Suggested topics:</p>
                                <div className="flex flex-wrap gap-2">
                                    {topicSuggestions.map((topic, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setAiTopic(topic)}
                                            className="px-3 py-1 bg-white border border-purple-300 rounded-full text-sm text-purple-700 hover:bg-purple-100"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleAiGenerate}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>Generate Blog</>
                                )}
                            </button>
                            <button
                                onClick={() => setShowAiPanel(false)}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text" required
                            className="w-full mt-1 p-2 border rounded-lg text-gray-900"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-lg text-gray-900"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                        />
                        {formData.image && (
                            <div className="mt-2">
                                <img src={formData.image} alt="Preview" className="h-32 object-cover rounded-lg" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content (HTML supported)</label>
                        <p className="text-xs text-gray-500 mb-1">Use &lt;p&gt;, &lt;b&gt;, &lt;h2&gt; tags for formatting.</p>
                        <textarea
                            required
                            rows={12}
                            className="w-full mt-1 p-2 border rounded-lg font-mono text-sm text-gray-900"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={e => setFormData({ ...formData, published: e.target.checked })}
                            className="h-4 w-4 bg-[#732C3F]"
                        />
                        <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit" disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Post'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); setCurrentPost(null); setFormData({ title: '', content: '', image: '', published: false }); }}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : !showAiPanel && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500">No blog posts found. Create one!</td>
                                </tr>
                            ) : posts.map((post: any) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{post.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 flex gap-3">
                                        <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
