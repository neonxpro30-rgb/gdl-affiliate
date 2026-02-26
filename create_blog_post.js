const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBlogPost() {
    const blogPost = await prisma.post.create({
        data: {
            title: "How LearnPeak Helps You Build a Successful Digital Career",
            slug: "how-learnpeak-helps-you-succeed",
            excerpt: "Discover how LearnPeak empowers students and professionals with practical digital skills, affiliate marketing training, and a supportive community to achieve financial freedom.",
            content: `
<p>At <strong>LearnPeak</strong>, we believe that everyone deserves access to quality education that can transform their lives. In today's digital age, traditional degrees alone are no longer enough. You need practical, in-demand skills that can help you earn from day one.</p>

<h2>🎯 Our Mission: Your Success</h2>
<p>We're not just another online course platform. LearnPeak is built on a simple vision: <strong>to help you achieve financial freedom through digital skills</strong>. Whether you're a student looking for extra income, a professional wanting to switch careers, or an entrepreneur building your online business – we have something for everyone.</p>

<h2>📚 What We Offer</h2>

<h3>1. Practical Digital Skills Training</h3>
<p>Our courses are designed by industry experts who have actually made money using these skills. No fluff, no outdated theories – just actionable knowledge:</p>
<ul>
<li><strong>Affiliate Marketing Mastery</strong> – Learn how to earn passive income by promoting products you love</li>
<li><strong>Content Creation</strong> – Create engaging content that attracts and converts</li>
<li><strong>Video Editing</strong> – Master professional video editing on your mobile phone</li>
<li><strong>Social Media Marketing</strong> – Build your brand and grow your following</li>
<li><strong>Facebook & Instagram Ads</strong> – Run profitable paid campaigns</li>
</ul>

<h3>2. Lifetime Access</h3>
<p>When you join LearnPeak, you get <strong>lifetime access</strong> to all your courses. Learn at your own pace, revisit lessons anytime, and stay updated with new content we add regularly.</p>

<h3>3. Earn While You Learn</h3>
<p>Our unique affiliate program lets you earn while you learn. Share LearnPeak with others and earn commissions on every successful referral. It's a win-win – you help others discover valuable skills while building your own income stream.</p>

<h3>4. Community Support</h3>
<p>You're never alone on this journey. Join our community of like-minded learners, share experiences, ask questions, and celebrate wins together. Our team is always ready to help you succeed.</p>

<h2>💡 Who Is LearnPeak For?</h2>
<ul>
<li><strong>College Students</strong> – Start earning before you graduate</li>
<li><strong>Working Professionals</strong> – Build side income or prepare for a career switch</li>
<li><strong>Housewives</strong> – Work from home on your own schedule</li>
<li><strong>Entrepreneurs</strong> – Learn marketing skills to grow your business</li>
<li><strong>Anyone</strong> – Who wants to break free from the 9-5 cycle</li>
</ul>

<h2>🚀 Start Your Journey Today</h2>
<p>Don't wait for the "right time" – there's no better time than now. Thousands of students have already transformed their lives with LearnPeak. Are you next?</p>

<p>Start with our <strong>Silicon Demo</strong> package at just ₹19 to experience the quality of our training. When you're ready, upgrade to Silver, Gold, or Diamond for the complete transformation.</p>

<p><strong>Your success story begins here. Welcome to LearnPeak.</strong> 🎓</p>
`,
            image: "https://res.cloudinary.com/dhahxfyvo/image/upload/v1734610448/learnpeak_help_banner.jpg",
            published: true,
            createdAt: new Date(), // This will be after Naksh's blog
        }
    });

    console.log('✅ Blog post created successfully!');
    console.log('Title:', blogPost.title);
    console.log('Slug:', blogPost.slug);
    console.log('URL: https://learnpeak.in/blog/' + blogPost.slug);

    process.exit(0);
}

createBlogPost().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
