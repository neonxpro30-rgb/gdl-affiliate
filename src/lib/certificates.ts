import { db } from '@/lib/firebaseAdmin';

// Certificate issuance: unique ID LP-YY-#### from a counter doc.
// Certificates are data in Firestore; the PDF is rendered on demand by
// /api/certificates/[certId]/pdf — nothing binary is stored.
//
// The sequence allocation and the certificate creation happen inside
// ONE Firestore transaction (audit #19): previously the counter was
// read, incremented and written in separate steps, so two concurrent
// issuances could read the same seq and the second cert would silently
// overwrite the first under the same LP-YY-#### id.

export async function issueCertificate(userId: string, courseSlug: string, courseTitle: string): Promise<any> {
    // Fast path: the user already holds a valid cert for this course.
    const existing = await db.collection('certificates')
        .where('userId', '==', userId).where('courseSlug', '==', courseSlug).where('status', '==', 'valid')
        .limit(1).get();
    if (!existing.empty) return { id: existing.docs[0].id, ...existing.docs[0].data() };

    const counterRef = db.collection('meta').doc('certificateCounter');
    const userRef = db.collection('users').doc(userId);
    const certsRef = db.collection('certificates');

    return db.runTransaction(async (tx) => {
        // Re-check duplicates inside the transaction: a concurrent
        // issuance for the same user+course may have committed between
        // the fast-path check above and this transaction running.
        const dupSnap = await tx.get(
            certsRef.where('userId', '==', userId).where('courseSlug', '==', courseSlug).where('status', '==', 'valid').limit(1)
        );
        if (!dupSnap.empty) return { id: dupSnap.docs[0].id, ...dupSnap.docs[0].data() };

        const userDoc = await tx.get(userRef);
        const userName = (userDoc.data() as any)?.name || 'Student';

        const counterDoc = await tx.get(counterRef);
        const seq = ((counterDoc.data() as any)?.seq || 0) + 1;

        const yy = new Date().getFullYear().toString().slice(2);
        const certId = `LP-${yy}-${String(seq).padStart(4, '0')}`;
        const now = new Date().toISOString();
        const data = {
            certId, userId, userName, courseSlug, courseTitle,
            issuedAt: now, completionDate: now, status: 'valid',
        };

        tx.set(counterRef, { seq }, { merge: true });
        tx.set(certsRef.doc(certId), data);
        return { id: certId, ...data };
    });
}

export async function getCertificate(certId: string): Promise<any | null> {
    const doc = await db.collection('certificates').doc(certId).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };
    const snap = await db.collection('certificates').where('certId', '==', certId).limit(1).get();
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    return null;
}
