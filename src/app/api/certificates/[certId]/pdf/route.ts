import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { getCertificate } from '@/lib/certificates';

// Renders the certificate PDF on demand from Firestore data.
// Design follows the sample certificate on the new homepage: light,
// gold "test passed" accent, signed by the founder. It states plainly
// that it is a LearnPeak certificate of completion — not a government
// or university qualification.
export async function GET(_req: Request, { params }: { params: Promise<{ certId: string }> }) {
    try {
        const { certId } = await params;
        const cert = await getCertificate(certId);
        if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        if (cert.status === 'revoked') return NextResponse.json({ error: 'Certificate revoked' }, { status: 410 });

        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

        const W = 841.89, H = 595.28;
        doc.rect(0, 0, W, H).fill('#F7F3EC');
        doc.rect(28, 28, W - 56, H - 56).lineWidth(3).stroke('#B98A2F');
        doc.rect(40, 40, W - 80, H - 80).lineWidth(1).stroke('#B98A2F');

        doc.fill('#1E293B').font('Helvetica-Bold').fontSize(30).text('CERTIFICATE OF COMPLETION', 0, 110, { align: 'center', width: W });
        doc.font('Helvetica').fontSize(13).fill('#64748B').text('LearnPeak — Wedding Video Editing School', 0, 152, { align: 'center', width: W });

        doc.fontSize(15).fill('#334155').text('This is to certify that', 0, 205, { align: 'center', width: W });
        doc.font('Helvetica-Bold').fontSize(34).fill('#7C2D12').text(cert.userName || 'Student', 0, 232, { align: 'center', width: W });
        doc.font('Helvetica').fontSize(15).fill('#334155')
            .text('has successfully completed all lessons, assignments and the final test of', 0, 285, { align: 'center', width: W });
        doc.font('Helvetica-Bold').fontSize(21).fill('#1E293B').text(cert.courseTitle || cert.courseSlug, 0, 312, { align: 'center', width: W });

        const dateStr = new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.font('Helvetica').fontSize(12).fill('#475569')
            .text(`Completed on ${dateStr}  ·  Certificate ID: ${cert.certId}`, 0, 360, { align: 'center', width: W });
        doc.fontSize(10).fill('#94A3B8')
            .text('This is a LearnPeak certificate of completion. It is not a government or university qualification.', 0, 384, { align: 'center', width: W });
        doc.text(`Verify at https://learnpeak.in/verify/${cert.certId}`, 0, 402, { align: 'center', width: W });

        doc.font('Helvetica-Bold').fontSize(14).fill('#1E293B').text('Naksh Gupta', 590, 448, { width: 200, align: 'center' });
        doc.moveTo(610, 446).lineTo(770, 446).lineWidth(1).stroke('#475569');
        doc.font('Helvetica').fontSize(10).fill('#64748B').text('Naksh Gupta, Founder, LearnPeak', 590, 466, { width: 200, align: 'center' });

        doc.font('Helvetica-Bold').fontSize(12).fill('#B98A2F').text('★ TEST PASSED', 60, 452, { width: 200 });

        doc.end();
        const pdf = await done;
        return new NextResponse(new Uint8Array(pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${cert.certId}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Certificate PDF error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
