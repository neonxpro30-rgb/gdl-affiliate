import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

// Student-side project status flow:
// assigned -> in_progress -> submitted -> (admin: revision ->) submitted -> approved -> paid
const STUDENT_TRANSITIONS: Record<string, string[]> = {
    assigned: ['in_progress'],
    in_progress: ['submitted'],
    revision: ['submitted'],
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const { status, submissionLink } = await req.json();
        if (submissionLink && !/^https?:\/\/\S+$/i.test(String(submissionLink).trim())) {
            return NextResponse.json({ error: 'Submission link must be a full https:// link' }, { status: 400 });
        }
        if (status === 'submitted' && !submissionLink) {
            return NextResponse.json({ error: 'Add your submission link before submitting' }, { status: 400 });
        }

        const ref = db.collection('projects').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        const project = doc.data() as any;
        if (project.assigneeId !== session.user.id) return NextResponse.json({ error: 'Not your project' }, { status: 403 });

        const allowed = STUDENT_TRANSITIONS[project.status] || [];
        if (!allowed.includes(status)) {
            return NextResponse.json({ error: `Cannot move ${project.status} -> ${status}` }, { status: 400 });
        }
        await ref.update({
            status,
            ...(submissionLink ? { submissionLink } : {}),
            updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true, status });
    } catch (error) {
        console.error('Project status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
