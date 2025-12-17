import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendWelcomeEmail(toEmail: string, userName: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Skipping Welcome Email: Credentials missing.");
        return;
    }

    const mailOptions = {
        from: `"LearnPeak Team" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Welcome to LearnPeak, ${userName}! 🚀`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #732C3F;">Welcome to LearnPeak!</h1>
                </div>
                
                <p>Hi <strong>${userName}</strong>,</p>
                
                <p>Thank you for joining <strong>LearnPeak</strong>! We are thrilled to have you on board.</p>
                
                <p>You have successfully registered for an account. Your journey to mastering digital skills starts now.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Next Steps:</strong></p>
                    <ul style="margin-top: 10px;">
                        <li>Complete your profile in the Dashboard.</li>
                        <li>Explore your enrolled courses.</li>
                        <li>Join our community groups.</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://learnpeak.in/login" style="background-color: #732C3F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    If you have any questions, reply to this email or contact us at <a href="mailto:support@learnpeak.in">support@learnpeak.in</a>.
                </p>
                
                <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} LearnPeak. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }
}
