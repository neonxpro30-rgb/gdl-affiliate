'use client';

import { useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileUploadProps {
    currentPhotoUrl?: string;
    userName: string;
}

export default function ProfileUpload({ currentPhotoUrl, userName }: ProfileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/user/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || 'Upload failed');
            }

            const data = await res.json();
            setPhotoUrl(data.url);
            router.refresh(); // Refresh to update server components
        } catch (error: any) {
            console.error('Error uploading profile picture:', error);
            alert(`Failed to upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={64} className="text-gray-400" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                    <Camera size={20} />
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Change Profile Photo</p>
        </div>
    );
}
