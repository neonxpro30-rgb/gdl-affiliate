'use client';

import { useState, useEffect } from 'react';

export default function BlogManager() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '', image: '', published: false });
    const [loading, setLoading] = useState(false);

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
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#732C3F] text-white px-4 py-2 rounded-lg hover:bg-[#5a2231]"
                    >
                        Create New Post
                    </button>
                )}
            </div>

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
            ) : (
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
