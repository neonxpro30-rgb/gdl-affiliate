// Test email sending
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass exists:', !!process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: 'neonxpro30@gmail.com',
            subject: 'Test Email - LearnPeak Daily Post System',
            text: 'This is a test email to verify the email system is working.',
            html: '<h1>Test Email</h1><p>If you see this, the email system is working!</p>'
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

testEmail();
