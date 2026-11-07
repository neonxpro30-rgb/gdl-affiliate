import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, phone, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Configure Nodemailer Transporter
        // Note: For Gmail, you need to use an App Password if 2FA is on.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // e.g., learnpeak.in@gmail.com
                pass: process.env.EMAIL_PASS  // App Password
            }
        });

        // Escape user input before it lands in the HTML email (audit
        // #30) — an unescaped submission could inject markup/links into
        // the support inbox.
        const escapeHtml = (v: string) => v
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const mailOptions = {
            from: `"LearnPeak Support" <${process.env.EMAIL_USER}>`,
            to: 'learnpeak.in@gmail.com', // Always send to this support email
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone || 'Not Provided'}
                
                Message:
                ${message}
            `,
            html: `
                <h3>New Contact Request</h3>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not Provided')}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            `
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            // Never log the submission body (audit #30).
            console.log("Mock Email Sent (Missing Credentials): contact form submission received.");
            return NextResponse.json({ message: 'Message simulated (configure credentials to send real email)' });
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Message sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
