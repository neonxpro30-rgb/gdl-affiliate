// Upload generated images to Cloudinary (unsigned upload)
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret exists:', !!process.env.CLOUDINARY_API_SECRET);

// Images to upload
const imagesDir = '/Users/sdphotography/.gemini/antigravity/brain/b4f65f64-06fa-48bb-8dfc-e3caa25f6f68';

const images = [
    { file: 'learnpeak_monday_1_1766148932777.png', name: 'monday' },
    { file: 'learnpeak_tuesday_1_1766148953071.png', name: 'tuesday' },
    { file: 'learnpeak_wednesday_1_1766148973174.png', name: 'wednesday' },
    { file: 'learnpeak_thursday_1_1766148992261.png', name: 'thursday' },
    { file: 'learnpeak_friday_1_1766149009799.png', name: 'friday' },
    { file: 'learnpeak_saturday_1_1766149035410.png', name: 'saturday' },
    { file: 'learnpeak_friday_motivation_1766148734156.png', name: 'motivation' },
    { file: 'learnpeak_christmas_1766148756534.png', name: 'christmas' },
    { file: 'learnpeak_affiliate_promo_1766148779460.png', name: 'affiliate' }
];

async function uploadImages() {
    const results = {};

    for (const img of images) {
        const filePath = path.join(imagesDir, img.file);

        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${img.file} - file not found`);
            continue;
        }

        try {
            console.log(`Uploading ${img.name}...`);
            const result = await cloudinary.uploader.upload(filePath, {
                public_id: `social_${img.name}`,
                resource_type: 'image'
            });

            results[img.name] = result.secure_url;
            console.log(`✅ ${img.name}: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Error uploading ${img.name}:`, error.message);
        }
    }

    console.log('\n📋 All URLs:');
    console.log(JSON.stringify(results, null, 2));

    return results;
}

uploadImages();
