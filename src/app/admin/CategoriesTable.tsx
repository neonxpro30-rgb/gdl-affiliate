'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesTable({ categories }: { categories: any[] }) {
    const router = useRouter();
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [categoryCourses, setCategoryCourses] = useState<any[]>([]);
    const [courseFormData, setCourseFormData] = useState<any>({});
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.refresh();
                setIsAddOpen(false);
                setFormData({});
            } else {
                alert('Failed to create category');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourses = async (category: any) => {
        setSelectedCategory(category);
        setLoading(true);
        try {
            // Fetch courses for this category
            // Note: In a real app, we might want a dedicated API for this, 
            // but for now we can filter client-side if we had all courses, 
            // or fetch from the courses API with a query param.
            // Since we don't have a filter API yet, we'll fetch all and filter (not ideal for large datasets but works for now)
            // OR better, let's just pass courses as a prop if possible, but CategoriesTable doesn't have it.
            // Let's fetch from /api/admin/courses and filter.
            const res = await fetch('/api/admin/courses');
            if (res.ok) {
                const allCourses = await res.json();
                const filtered = allCourses.filter((c: any) => c.category === category.title);
                setCategoryCourses(filtered);
                setIsCoursesOpen(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        setLoading(true);
        try {
            const payload = { ...courseFormData, category: selectedCategory.title };
            const res = await fetch(`/api/admin/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                // Refresh courses list
                const newCourse = await res.json(); // Assuming API returns created course
                // Re-fetch to be safe or just append if API returns it. 
                // Our API might not return the object, so let's re-fetch.
                const coursesRes = await fetch('/api/admin/courses');
                if (coursesRes.ok) {
                    const allCourses = await coursesRes.json();
                    const filtered = allCourses.filter((c: any) => c.category === selectedCategory.title);
                    setCategoryCourses(filtered);
                }
                setIsAddCourseOpen(false);
                setCourseFormData({});
                router.refresh();
            } else {
                alert('Failed to create course');
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
                    onClick={() => setIsAddOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Add New Category
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Order</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">No categories found.</td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.title} className="w-12 h-12 object-cover rounded-md" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Img</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{cat.title}</td>
                                    <td className="p-4 text-gray-600">{cat.order || 0}</td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleViewCourses(cat)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View Courses
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Category Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md text-gray-900">
                        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Category Title"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                required
                            />
                            <input
                                placeholder="Image URL"
                                value={formData.image || ''}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                type="number"
                                placeholder="Order (e.g. 1)"
                                value={formData.order || ''}
                                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={loading || !formData.title}
                                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Courses Modal */}
            {isCoursesOpen && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Courses in {selectedCategory.title}</h2>
                            <button
                                onClick={() => setIsAddCourseOpen(true)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Add Course Here
                            </button>
                        </div>

                        {isAddCourseOpen && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-bold mb-2">Add New Course to {selectedCategory.title}</h3>
                                <div className="space-y-3">
                                    <input
                                        placeholder="Course Title"
                                        value={courseFormData.title || ''}
                                        onChange={e => setCourseFormData({ ...courseFormData, title: e.target.value })}
                                        className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={courseFormData.description || ''}
                                        onChange={e => setCourseFormData({ ...courseFormData, description: e.target.value })}
                                        className="w-full border p-2 rounded h-20 bg-white text-gray-900 border-gray-300"
                                    />
                                    <input
                                        placeholder="Video Link (YouTube/Vimeo)"
                                        value={courseFormData.videoLink || ''}
                                        onChange={e => setCourseFormData({ ...courseFormData, videoLink: e.target.value })}
                                        className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsAddCourseOpen(false)} className="px-3 py-1 text-gray-600 text-sm">Cancel</button>
                                        <button
                                            onClick={handleAddCourse}
                                            disabled={loading}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                        >
                                            {loading ? 'Adding...' : 'Add Course'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {categoryCourses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No courses in this category yet.</p>
                            ) : (
                                categoryCourses.map((course) => (
                                    <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <div>
                                            <p className="font-medium">{course.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{course.videoLink}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setIsCoursesOpen(false)} className="px-4 py-2 text-gray-600">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
