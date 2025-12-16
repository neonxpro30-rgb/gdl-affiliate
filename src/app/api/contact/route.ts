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
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not Provided'}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("Mock Email Sent (Missing Credentials):", mailOptions);
            return NextResponse.json({ message: 'Message simulated (configure credentials to send real email)' });
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Message sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
