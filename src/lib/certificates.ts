import { db } from '@/lib/firebaseAdmin';

// Certificate issuance: unique ID LP-YY-#### from a counter doc.
// Certificates are data in Firestore; the PDF is rendered on demand by
// /api/certificates/[certId]/pdf — nothing binary is stored.

export async function issueCertificate(userId: string, courseSlug: string, courseTitle: string): Promise<any> {
    const existing = await db.collection('certificates')
        .where('userId', '==', userId).where('courseSlug', '==', courseSlug).where('status', '==', 'valid')
        .limit(1).get();
    if (!existing.empty) return { id: existing.docs[0].id, ...existing.docs[0].data() };

    const userDoc = await db.collection('users').doc(userId).get();
    const userName = (userDoc.data() as any)?.name || 'Student';

    const counterRef = db.collection('meta').doc('certificateCounter');
    const counterDoc = await counterRef.get();
    const seq = ((counterDoc.data() as any)?.seq || 0) + 1;
    await counterRef.set({ seq }, { merge: true });

    const yy = new Date().getFullYear().toString().slice(2);
    const certId = `LP-${yy}-${String(seq).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const data = {
        certId, userId, userName, courseSlug, courseTitle,
        issuedAt: now, completionDate: now, status: 'valid',
    };
    await db.collection('certificates').doc(certId).set(data);
    return { id: certId, ...data };
}

export async function getCertificate(certId: string): Promise<any | null> {
    const doc = await db.collection('certificates').doc(certId).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };
    const snap = await db.collection('certificates').where('certId', '==', certId).limit(1).get();
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    return null;
}
