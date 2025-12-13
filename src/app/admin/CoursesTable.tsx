'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesTable({ courses, categories = [] }: { courses: any[], categories?: any[] }) {
    const router = useRouter();
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState<any>({});

    const handleEditClick = (course: any) => {
        setSelectedCourse(course);
        setFormData(course);
        setIsEditOpen(true);
    };

    const handleAddClick = () => {
        setFormData({});
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.refresh();
                setIsEditOpen(false);
            } else {
                alert('Failed to update course');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.refresh();
                setIsAddOpen(false);
            } else {
                alert('Failed to create course');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete course');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAddClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Add New Course
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Video Link</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{course.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                        ${course.category === 'Diamond' ? 'bg-purple-100 text-purple-700' :
                                            course.category === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                        {course.category}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{course.description}</td>
                                <td className="p-4 text-sm text-blue-600 truncate max-w-xs">
                                    <a href={course.videoLink} target="_blank" rel="noopener noreferrer">{course.videoLink}</a>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(course)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg text-gray-900">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Course</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Title"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded h-24 bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Video Link"
                                value={formData.videoLink || ''}
                                onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <select
                                value={formData.category || ''}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            >
                                <option value="">Select Category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.title}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg text-gray-900">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Course</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Title"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded h-24 bg-white text-gray-900 border-gray-300"
                                required
                            />
                            <input
                                placeholder="Video Link"
                                value={formData.videoLink || ''}
                                onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                required
                            />
                            <select
                                value={formData.category || ''}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            >
                                <option value="">Select Category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.title}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                onClick={() => {
                                    if (!formData.title || !formData.description || !formData.videoLink) {
                                        alert('Please fill in all fields');
                                        return;
                                    }
                                    handleCreate();
                                }}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
