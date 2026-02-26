import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dhahxfyvo',
    api_key: '155648641738369',
    api_secret: 'i6ClF86BVqH0CBljsOhVp3c2swY'
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert buffer to base64 for Cloudinary upload
        const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'gdl_profiles',
            public_id: `user_${session.user.id}`,
            overwrite: true,
            transformation: [{ width: 500, height: 500, crop: 'fill' }] // Optimize image
        });

        // Update user profile in Firestore
        await db.collection('users').doc(session.user.id).update({
            photoURL: result.secure_url
        });

        return NextResponse.json({ url: result.secure_url });

    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
