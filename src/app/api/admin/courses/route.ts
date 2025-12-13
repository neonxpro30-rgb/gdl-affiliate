import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await db.collection('packages').get(); // Courses are inside packages in current schema?
        // Wait, the schema has 'packages' which contain 'courses' (array of strings).
        // The user wants to manage "courses" individually and assign them to categories (packages?).
        // Or does the user want a separate 'courses' collection?
        // "admin panale me cours controll ka option do taki hun sabhi cours ko manage kar sake or agar koi nayi catagry banani hai and uske andar video link and discription or title add karna hai to wo bhi kar sakun"
        // This implies a more complex structure than just strings in a package.
        // I should create a 'courses' collection and link packages to courses, OR just manage 'packages' as the "Category" and put courses inside them.
        // Let's stick to the current structure but enhance it: 'packages' collection contains the "Categories" (Silver, Gold, Diamond).
        // And we can add a 'content' field to packages which is an array of objects { title, description, videoLink }.
        // OR better: Create a root 'courses' collection and have a 'packageId' or 'category' field.
        // Let's go with a root 'courses' collection for better management, and packages will reference them or we just filter by category.
        // But the current 'packages' collection is used for pricing and access control.
        // Let's fetch 'packages' as "Categories".

        // Actually, let's create a new 'courses' collection.
        // Fields: title, description, videoLink, category (Silver/Gold/Diamond).

        const coursesSnapshot = await db.collection('courses').get();
        const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, videoLink, category } = body;

        await db.collection('courses').add({
            title,
            description,
            videoLink,
            category, // e.g., 'Silver', 'Gold', 'Diamond'
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
