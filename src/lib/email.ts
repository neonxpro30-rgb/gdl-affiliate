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

export async function sendSaleNotificationEmail(toEmail: string, mentorName: string, buyerName: string, packageName: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const mailOptions = {
        from: `"LearnPeak Team" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Cha-Ching! New Sale: ${packageName} 💰`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #28a745;">Congratulations, ${mentorName}! 🥳</h1>
                </div>
                
                <p>Great news! You have a new referral.</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #28a745;">
                    <p style="margin: 5px 0;"><strong>Buyer:</strong> ${buyerName}</p>
                    <p style="margin: 5px 0;"><strong>Package:</strong> ${packageName}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: green; font-weight: bold;">Confirmed</span></p>
                </div>
                
                <p>Keep up the great work! Your earnings have been updated in your dashboard.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://learnpeak.in/dashboard" style="background-color: #732C3F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Check Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    LearnPeak Affiliate System
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Sale notification email sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send sale notification:", error);
    }
}

// Send daily social media post email
export async function sendDailyPostEmail(
    toEmail: string,
    postData: {
        type: 'festival' | 'daily';
        caption: string;
        hashtags: string[];
        imageUrl: string;
        festivalName?: string;
        dayTheme?: string;
    }
) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Skipping Daily Post Email: Credentials missing.");
        return { success: false, error: "Email credentials missing" };
    }

    const today = new Date();
    const dateString = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const postTitle = postData.festivalName
        ? `🎉 ${postData.festivalName} Special`
        : `📅 ${postData.dayTheme || 'Daily Post'}`;

    const hashtagsFormatted = postData.hashtags.map(tag => `#${tag}`).join(' ');
    const fullCaption = `${postData.caption}\n\n${hashtagsFormatted}`;

    const mailOptions = {
        from: `"LearnPeak Social" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `📬 LearnPeak Daily Post Ready - ${dateString}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #732C3F 0%, #a84860 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📬 Today's Instagram Post</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${dateString}</p>
                </div>
                
                <!-- Content -->
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Post Type Badge -->
                    <div style="margin-bottom: 20px;">
                        <span style="background: ${postData.type === 'festival' ? '#28a745' : '#732C3F'}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                            ${postTitle}
                        </span>
                    </div>
                    
                    <!-- Caption Box -->
                    <div style="background: #f8f9fa; border-left: 4px solid #732C3F; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333; font-size: 14px;">📝 Caption (Copy This):</p>
                        <div style="white-space: pre-line; line-height: 1.6; color: #444; font-size: 14px;">${postData.caption}</div>
                    </div>
                    
                    <!-- Hashtags Box -->
                    <div style="background: #e8f4fd; border-left: 4px solid #007bff; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333; font-size: 14px;">🏷️ Hashtags:</p>
                        <p style="margin: 0; color: #007bff; font-size: 13px; word-wrap: break-word;">${hashtagsFormatted}</p>
                    </div>
                    
                    <!-- Image Section -->
                    <div style="margin: 25px 0; text-align: center;">
                        <p style="margin: 0 0 15px 0; font-weight: bold; color: #333; font-size: 14px;">🖼️ Suggested Image:</p>
                        <a href="${postData.imageUrl}" target="_blank">
                            <img src="${postData.imageUrl}" alt="Post Image" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);">
                        </a>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                            Click image to open full size. <br>
                            <a href="${postData.imageUrl}" style="color: #732C3F;">Download Image →</a>
                        </p>
                    </div>
                    
                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                    
                    <!-- Quick Steps -->
                    <div style="background: linear-gradient(135deg, #fef9f0 0%, #fff5e6 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 15px 0; font-weight: bold; color: #333; font-size: 14px;">⚡ Quick Steps:</p>
                        <ol style="margin: 0; padding-left: 20px; color: #555; line-height: 2;">
                            <li>Copy the caption above</li>
                            <li>Download/save the image</li>
                            <li>Open <a href="https://publish.buffer.com" style="color: #732C3F;">Buffer</a></li>
                            <li>Create new post → Paste caption</li>
                            <li>Upload image</li>
                            <li>Schedule for 5:00 PM</li>
                            <li>Done! ✅</li>
                        </ol>
                    </div>
                    
                    <!-- Full Caption for Easy Copy -->
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333; font-size: 13px;">📋 Full Post (Caption + Hashtags):</p>
                        <textarea readonly style="width: 100%; min-height: 150px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: inherit; font-size: 13px; resize: vertical; box-sizing: border-box;">${fullCaption}</textarea>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
                    <p style="margin: 0;">LearnPeak Auto Content System</p>
                    <p style="margin: 5px 0 0 0;">This email was generated automatically.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Daily post email sent to ${toEmail}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to send daily post email:", error);
        return { success: false, error: String(error) };
    }
}
