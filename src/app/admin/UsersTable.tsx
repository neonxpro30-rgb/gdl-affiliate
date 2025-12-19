'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersTable({ users }: { users: any[] }) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);

    // Form States
    const [formData, setFormData] = useState<any>({});

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = showInactive ? true : user.isActive !== false; // Hide inactive by default

        return matchesSearch && matchesStatus;
    });

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setFormData(user);
        setIsEditOpen(true);
    };

    const handleAddClick = () => {
        setFormData({});
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.refresh();
                setIsEditOpen(false);
            } else {
                alert('Failed to update user');
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
            const res = await fetch(`/api/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.refresh();
                setIsAddOpen(false);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create user');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh();
                setIsDeleteOpen(false);
                setUserToDelete(null);
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
                <div className="flex w-full md:w-auto gap-4 items-center">
                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Show Inactive</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Search by Name, Email, or ID..."
                        className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm whitespace-nowrap"
                    >
                        + Add User
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Ref Code (ID)</th>
                            <th className="p-4">Bank Details</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No users found matching "{searchTerm}"
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-50 ${user.isActive === false ? 'bg-red-50' : ''}`}>
                                    <td className="p-4 font-medium text-gray-900">
                                        {user.name}
                                        {user.isActive === false && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                                                INACTIVE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-900">{user.email}</td>
                                    <td className="p-4 text-gray-900">{user.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-900">{user.referralCode}</td>
                                    <td className="p-4 text-sm text-gray-700">
                                        {user.bankName ? (
                                            <div>
                                                <p className="font-medium">{user.bankName}</p>
                                                <p>{user.accountNumber}</p>
                                            </div>
                                        ) : 'Not added'}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`)) {
                                                    await fetch(`/api/admin/users/${user.id}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ isActive: !user.isActive }),
                                                    });
                                                    router.refresh();
                                                }
                                            }}
                                            className={`font-medium ${user.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteClick(user);
                                            }}
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

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg text-gray-900">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                            <input
                                placeholder="Name"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Email"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Phone"
                                value={formData.phone || ''}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <select
                                value={formData.role || 'USER'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-bold mb-2">Account Status</h3>
                                <label className="flex items-center space-x-2 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive === true}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                                    />
                                    <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </label>

                                <h3 className="font-bold mb-2">Password</h3>
                                <input
                                    placeholder="New Password (leave empty to keep current)"
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border p-2 rounded mb-4 bg-white text-gray-900 border-gray-300"
                                />

                                <h3 className="font-bold mb-2">Package</h3>
                                <select
                                    value={formData.packageId || ''}
                                    onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                                    className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                                >
                                    <option value="">-- No Package --</option>
                                    <option value="MpGVLpGKOC2ZVIqNhPHP">Silicon Demo (₹19)</option>
                                    <option value="iNTdTLQDg9SEiiQgEBys">Silver Package (₹799)</option>
                                    <option value="qnMIC31N3hOVTtvC54ld">Gold Package (₹1299)</option>
                                    <option value="u3jTxLpjNONM5nbzJprc">Diamond Package (₹3899)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Note: Changing package will update access immediately.</p>
                            </div>

                            <h3 className="font-bold mt-4">Bank Details</h3>
                            <input
                                placeholder="Bank Name"
                                value={formData.bankName || ''}
                                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Account Number"
                                value={formData.accountNumber || ''}
                                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="IFSC Code"
                                value={formData.ifscCode || ''}
                                onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="UPI ID"
                                value={formData.upiId || ''}
                                onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
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
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Name"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Email"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Password"
                                type="password"
                                value={formData.password || ''}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <input
                                placeholder="Phone"
                                value={formData.phone || ''}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            />
                            <select
                                value={formData.role || 'USER'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md text-gray-900">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete User?</h2>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete <strong>{userToDelete.name}</strong>?
                            <br /><span className="text-sm text-gray-500">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                {loading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
